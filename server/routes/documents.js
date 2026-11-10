const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Document, Workspace } = require('../config/db');
const {
  extractText,
  formatBytes,
  createSummary,
  createPreview
} = require('../services/documentParser');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${uniqueSuffix}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// POST /api/documents/upload (TC-01)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Berkas file wajib disertakan dalam field "file"',
        error_code: 'FILE_REQUIRED'
      });
    }

    const { originalname, mimetype, size, path: filePath } = req.file;
    const workspaceId = req.body.workspace_id || 'default-workspace';

    // Parse and extract content
    const { extractedText, fileHash } = await extractText(filePath, mimetype, originalname);
    const summary = req.body.summary || createSummary(extractedText);
    const previewText = createPreview(extractedText);
    const formattedSize = formatBytes(size);

    const doc = await Document.create({
      workspace_id: workspaceId,
      filename: originalname,
      file_path: filePath,
      file_size: size,
      file_size_formatted: formattedSize,
      mime_type: mimetype || 'application/octet-stream',
      file_hash: fileHash,
      extracted_text: extractedText,
      summary,
      preview_text: previewText
    });

    // Optionally bump workspace doc count
    try {
      if (workspaceId && workspaceId !== 'default-workspace') {
        await Workspace.findByIdAndUpdate(workspaceId, { $inc: { document_count: 1 } });
      }
    } catch (_) {
      // Ignore if workspaceId is not standard ObjectId
    }

    return res.status(201).json({
      success: true,
      message: 'Dokumen berhasil diunggah dan diproses',
      data: doc.toJSON()
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memproses unggahan dokumen: ' + err.message,
      error_code: 'UPLOAD_PROCESSING_ERROR'
    });
  }
});

// GET /api/documents
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.workspace_id) {
      filter.workspace_id = req.query.workspace_id;
    }

    const docs = await Document.find(filter).sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      message: 'Daftar dokumen berhasil dimuat',
      data: docs.map((d) => d.toJSON())
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat dokumen: ' + err.message,
      error_code: 'SERVER_ERROR'
    });
  }
});

// GET /api/documents/:id
router.get('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan',
        error_code: 'DOCUMENT_NOT_FOUND'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Detail dokumen berhasil diambil',
      data: doc.toJSON()
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail dokumen: ' + err.message,
      error_code: 'SERVER_ERROR'
    });
  }
});

// GET /api/documents/:id/download (TC-02)
router.get('/:id/download', async (req, res) => {
  try {
    let doc = null;
    try {
      doc = await Document.findById(req.params.id);
    } catch (_) {
      // invalid ObjectId
    }

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan atau berkas fisik terhapus',
        error_code: 'FILE_NOT_FOUND'
      });
    }

    const filePath = doc.file_path;
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan atau berkas fisik terhapus',
        error_code: 'FILE_NOT_FOUND'
      });
    }

    const stat = fs.statSync(filePath);
    res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.filename}"`);
    res.setHeader('Content-Length', stat.size);

    const stream = fs.createReadStream(filePath);
    stream.on('error', (err) => {
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Gagal membaca aliran berkas: ' + err.message,
          error_code: 'STREAM_ERROR'
        });
      }
    });

    return stream.pipe(res);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengunduh berkas: ' + err.message,
      error_code: 'SERVER_ERROR'
    });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan untuk dihapus',
        error_code: 'DOCUMENT_NOT_FOUND'
      });
    }

    if (doc.file_path && fs.existsSync(doc.file_path)) {
      try {
        fs.unlinkSync(doc.file_path);
      } catch (e) {
        console.warn(`[documents] Gagal menghapus file fisik ${doc.file_path}:`, e.message);
      }
    }

    try {
      if (doc.workspace_id) {
        await Workspace.findByIdAndUpdate(doc.workspace_id, { $inc: { document_count: -1 } });
      }
    } catch (_) {}

    return res.status(200).json({
      success: true,
      message: 'Dokumen berhasil dihapus',
      data: { id: req.params.id }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus dokumen: ' + err.message,
      error_code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
