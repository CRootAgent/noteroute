const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function calculateFileHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function createSummary(text, maxLen = 220) {
  if (!text) return 'Tidak ada konten teks yang dapat diekstrak.';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.substring(0, maxLen).trim() + '...';
}

function createPreview(text, maxLen = 300) {
  if (!text) return 'Pratinjau tidak tersedia.';
  const cleaned = text.replace(/\r?\n+/g, '\n').trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.substring(0, maxLen).trim() + '...';
}

async function extractText(filePath, mimeType, originalname) {
  const ext = (path.extname(originalname || filePath) || '').toLowerCase();
  const buffer = await fs.promises.readFile(filePath);
  let extractedText = '';
  let pageCount = 1;

  try {
    if (ext === '.pdf' || mimeType === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text || '';
      pageCount = pdfData.numpages || 1;
    } else if (
      ext === '.docx' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const docxData = await mammoth.extractRawText({ buffer });
      extractedText = docxData.value || '';
    } else {
      // TXT, Markdown, JSON, Code, CSV, etc.
      extractedText = buffer.toString('utf-8');
    }
  } catch (error) {
    console.error(`[documentParser] Failed to extract from ${originalname}:`, error.message);
    extractedText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, '');
  }

  const cleanText = (extractedText || '').replace(/\u0000/g, '').trim();

  return {
    extractedText: cleanText,
    pageCount,
    fileSize: buffer.length,
    fileHash: calculateFileHash(buffer)
  };
}

function chunkText(text, chunkSize = 800, overlap = 100) {
  if (!text) return [];
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    const chunk = text.slice(i, i + chunkSize).trim();
    if (chunk) chunks.push(chunk);
    i += chunkSize - overlap;
  }
  return chunks;
}

function findRelevantSnippet(extractedText, query, pageCount = 1) {
  if (!extractedText) {
    return {
      page: 1,
      snippet: 'Informasi dokumen ringkas.'
    };
  }

  const queryTerms = (query || '')
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const sentences = extractedText.split(/(?<=[.?!])\s+/);
  let bestSentence = sentences[0] || extractedText.slice(0, 160);
  let maxMatches = -1;

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    let matches = 0;
    for (const term of queryTerms) {
      if (lower.includes(term)) matches++;
    }
    if (matches > maxMatches && sentence.trim().length > 20) {
      maxMatches = matches;
      bestSentence = sentence.trim();
    }
  }

  const snippet = bestSentence.length > 240 ? bestSentence.slice(0, 240) + '...' : bestSentence;

  return {
    page: Math.max(1, Math.min(pageCount, 1)),
    snippet
  };
}

module.exports = {
  formatBytes,
  calculateFileHash,
  createSummary,
  createPreview,
  extractText,
  chunkText,
  findRelevantSnippet
};
