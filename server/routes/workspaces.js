const express = require('express');
const router = express.Router();
const { Workspace, Document } = require('../config/db');

// GET /api/workspaces
router.get('/', async (req, res) => {
  try {
    const userId = req.query.user_id || req.headers['x-user-id'];
    const query = userId ? { user_id: userId } : {};
    const workspaces = await Workspace.find(query).sort({ created_at: -1 });

    // Populate document count if available
    const result = await Promise.all(
      workspaces.map(async (ws) => {
        const json = ws.toJSON();
        const count = await Document.countDocuments({ workspace_id: json.id });
        json.document_count = count || ws.document_count || 0;
        return json;
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Daftar workspace berhasil diambil',
      data: result
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar workspace: ' + err.message,
      error_code: 'SERVER_ERROR'
    });
  }
});

// POST /api/workspaces
router.post('/', async (req, res) => {
  try {
    const { name, description, user_id } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nama workspace wajib diisi',
        error_code: 'VALIDATION_ERROR'
      });
    }

    const userId = user_id || req.headers['x-user-id'] || '';
    const ws = await Workspace.create({
      name: name.trim(),
      description: description || '',
      user_id: userId
    });

    return res.status(201).json({
      success: true,
      message: 'Workspace berhasil dibuat',
      data: ws.toJSON()
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat workspace: ' + err.message,
      error_code: 'SERVER_ERROR'
    });
  }
});

// GET /api/workspaces/:id
router.get('/:id', async (req, res) => {
  try {
    const ws = await Workspace.findById(req.params.id);
    if (!ws) {
      return res.status(404).json({
        success: false,
        message: 'Workspace tidak ditemukan',
        error_code: 'WORKSPACE_NOT_FOUND'
      });
    }

    const json = ws.toJSON();
    json.document_count = await Document.countDocuments({ workspace_id: json.id });

    return res.status(200).json({
      success: true,
      message: 'Detail workspace berhasil diambil',
      data: json
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil workspace: ' + err.message,
      error_code: 'SERVER_ERROR'
    });
  }
});

// DELETE /api/workspaces/:id
router.delete('/:id', async (req, res) => {
  try {
    const ws = await Workspace.findByIdAndDelete(req.params.id);
    if (!ws) {
      return res.status(404).json({
        success: false,
        message: 'Workspace tidak ditemukan untuk dihapus',
        error_code: 'WORKSPACE_NOT_FOUND'
      });
    }

    // Cascade delete documents
    await Document.deleteMany({ workspace_id: req.params.id });

    return res.status(200).json({
      success: true,
      message: 'Workspace dan dokumen terkait berhasil dihapus',
      data: { id: req.params.id }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus workspace: ' + err.message,
      error_code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
