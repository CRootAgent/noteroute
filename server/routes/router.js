const express = require('express');
const router = express.Router();
const { Document, ChatSession, AIEndpoint } = require('../config/db');
const { routeChat, getMetrics } = require('../services/llmRouterService');

// POST /api/router/chat (TC-03, TC-04, TC-05)
router.post('/chat', async (req, res) => {
  try {
    const { workspace_id, prompt, model_target = 'gemini', history = [], options = {} } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Prompt pertanyaan wajib diisi',
        error_code: 'PROMPT_REQUIRED'
      });
    }

    // Retrieve documents for grounding
    let documents = [];
    if (workspace_id) {
      try {
        documents = await Document.find({ workspace_id });
      } catch (_) {
        documents = [];
      }
    }

    // If no workspace-specific docs, fallback to recent documents
    if (!documents || documents.length === 0) {
      documents = await Document.find().limit(5);
    }

    // Route inference through Multi-LLM Gateway
    const chatResult = await routeChat({
      workspace_id,
      prompt: prompt.trim(),
      model_target,
      history,
      documents,
      options
    });

    // Record session message in DB asynchronously
    if (workspace_id) {
      try {
        await ChatSession.findOneAndUpdate(
          { workspace_id },
          {
            $push: {
              messages: [
                { role: 'user', content: prompt.trim() },
                {
                  role: 'assistant',
                  content: chatResult.response_text,
                  citations: chatResult.citations,
                  model_used: chatResult.model_used
                }
              ]
            }
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        // Non-fatal
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Inferensi sukses',
      data: chatResult
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menjalankan inferensi model: ' + err.message,
      error_code: 'INFERENCE_ERROR'
    });
  }
});

// GET /api/router/metrics (TC-06)
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await getMetrics();
    return res.status(200).json({
      success: true,
      message: 'Metrik token dan penghematan biaya berhasil dimuat',
      data: metrics
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat metrik: ' + err.message,
      error_code: 'METRICS_ERROR'
    });
  }
});

// GET /api/router/providers
router.get('/providers', async (req, res) => {
  try {
    const providers = await AIEndpoint.find().sort({ priority: 1 });
    if (!providers || providers.length === 0) {
      // Default baseline providers
      return res.status(200).json({
        success: true,
        message: 'Daftar provider aktif berhasil diambil',
        data: [
          { provider_name: 'gemini', priority: 1, is_active: true, description: 'Google Gemini 1.5 Flash (Free 1M context)' },
          { provider_name: 'groq', priority: 2, is_active: true, description: 'Groq Cloud Llama 3.3 70B (Fast Inference)' },
          { provider_name: 'deepseek', priority: 3, is_active: true, description: 'DeepSeek R1 / V3 Reasoning' },
          { provider_name: '9router_local', priority: 4, is_active: true, description: '9Router/OmniRoute Local Daemon port 20128' }
        ]
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Daftar provider aktif berhasil diambil',
      data: providers.map((p) => p.toJSON())
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil provider: ' + err.message,
      error_code: 'SERVER_ERROR'
    });
  }
});

// POST /api/router/providers
router.post('/providers', async (req, res) => {
  try {
    const { provider_name, base_url, api_key_encrypted, priority, is_active } = req.body;
    if (!provider_name) {
      return res.status(400).json({
        success: false,
        message: 'provider_name wajib diisi',
        error_code: 'VALIDATION_ERROR'
      });
    }

    const provider = await AIEndpoint.findOneAndUpdate(
      { provider_name },
      { base_url, api_key_encrypted, priority: priority || 1, is_active: is_active !== false },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      success: true,
      message: 'Provider berhasil disimpan',
      data: provider.toJSON()
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan provider: ' + err.message,
      error_code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
