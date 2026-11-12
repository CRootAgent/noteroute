const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const axios = require('axios');

const app = require('../server');
const { connectDB, disconnectDB, Workspace, Document, TokenUsageLog, AIEndpoint } = require('../config/db');
const {
  formatBytes,
  calculateFileHash,
  createSummary,
  createPreview,
  chunkText,
  findRelevantSnippet,
  extractText
} = require('../services/documentParser');
const {
  estimateTokens,
  calculateSavings,
  callGemini,
  callGroq,
  callDeepSeek,
  call9RouterLocal,
  routeChat,
  getMetrics
} = require('../services/llmRouterService');

let mongoServer;
let testWorkspaceId;
let uploadedDocId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await connectDB(uri);

  // Seed initial test workspace
  const ws = await Workspace.create({
    name: 'Materi Kuliah Semester 5',
    description: 'Slide kuliah sistem terdistribusi dan riset LLM'
  });
  testWorkspaceId = ws._id.toString();
}, 30000);

afterAll(async () => {
  await disconnectDB();
  if (mongoServer) {
    await mongoServer.stop();
  }

  // Clean up uploaded files in test uploads directory
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    for (const f of files) {
      if (f.includes('sample_lecture') || f.includes('Slide_Bab3') || f.includes('test')) {
        try {
          fs.unlinkSync(path.join(uploadsDir, f));
        } catch (_) {}
      }
    }
  }
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('🛡️ Modul A: Ingestion Engine & Multi-LLM Gateway Router (TC-01 - TC-06)', () => {
  // =========================================================================
  // TC-01: POST /api/documents/upload
  // =========================================================================
  test('TC-01: POST /api/documents/upload - Upload file PDF materi kuliah (5 halaman / sample PDF)', async () => {
    const pdfPath = path.join(__dirname, 'fixtures', 'sample_lecture.pdf');
    expect(fs.existsSync(pdfPath)).toBe(true);

    const response = await request(app)
      .post('/api/documents/upload')
      .field('workspace_id', testWorkspaceId)
      .attach('file', pdfPath);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('berhasil');
    expect(response.body.data).toBeDefined();

    const data = response.body.data;
    uploadedDocId = data.id;

    expect(data.filename).toBe('sample_lecture.pdf');
    expect(data.mime_type).toBe('application/pdf');
    expect(data.workspace_id).toBe(testWorkspaceId);
    expect(data.file_size).toBeGreaterThan(0);
    expect(data.file_size_formatted).toBeDefined();
    expect(data.extracted_text).toBeDefined();
    expect(data.summary).toBeDefined();
    expect(data.preview_text).toBeDefined();

    // Verify record in MongoDB
    const docInDb = await Document.findById(uploadedDocId);
    expect(docInDb).not.toBeNull();
    expect(docInDb.filename).toBe('sample_lecture.pdf');
  });

  test('TC-01b: POST /api/documents/upload - Upload file Markdown & TXT', async () => {
    const mdPath = path.join(__dirname, 'fixtures', 'Slide_Bab3_Distributed_Systems.md');
    const response = await request(app)
      .post('/api/documents/upload')
      .field('workspace_id', testWorkspaceId)
      .attach('file', mdPath);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.filename).toBe('Slide_Bab3_Distributed_Systems.md');
    expect(response.body.data.extracted_text).toContain('Teorema CAP');
  });

  test('TC-01c: POST /api/documents/upload - Validation error when file is missing', async () => {
    const response = await request(app)
      .post('/api/documents/upload')
      .field('workspace_id', testWorkspaceId);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error_code).toBe('FILE_REQUIRED');
  });

  // =========================================================================
  // TC-02: GET /api/documents/:id/download
  // =========================================================================
  test('TC-02: GET /api/documents/:id/download - Streaming download file ke HP', async () => {
    expect(uploadedDocId).toBeDefined();

    const response = await request(app)
      .get(`/api/documents/${uploadedDocId}/download`)
      .expect(200);

    expect(response.headers['content-type']).toBe('application/pdf');
    expect(response.headers['content-disposition']).toContain('attachment; filename="sample_lecture.pdf"');
    expect(response.headers['content-length']).toBeDefined();
    expect(parseInt(response.headers['content-length'], 10)).toBeGreaterThan(0);
    expect(response.body).toBeDefined();
  });

  test('TC-02b: GET /api/documents/:id/download - Return 404 when document not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const response = await request(app)
      .get(`/api/documents/${nonExistentId}/download`)
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error_code).toBe('FILE_NOT_FOUND');
  });

  // =========================================================================
  // TC-03: POST /api/router/chat (Direct Gemini)
  // =========================================================================
  test('TC-03: POST /api/router/chat - Tanya isi dokumen menggunakan Google Gemini 1.5 Flash', async () => {
    const response = await request(app)
      .post('/api/router/chat')
      .send({
        workspace_id: testWorkspaceId,
        prompt: 'Apa kesimpulan bab 3 mengenai konsistensi data terdistribusi dan Teorema CAP?',
        model_target: 'gemini',
        history: [
          { role: 'user', content: 'Halo NoteRoute' },
          { role: 'assistant', content: 'Halo! Ada yang bisa saya bantu dengan dokumen laptop Anda?' }
        ]
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Inferensi sukses');

    const data = response.body.data;
    expect(data.model_used).toBe('gemini-1.5-flash');
    expect(data.response_text).toBeDefined();
    expect(data.fallback_triggered).toBe(false);
    expect(data.latency_ms).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(data.citations)).toBe(true);
    expect(data.citations.length).toBeGreaterThan(0);
    expect(data.citations[0].filename).toBeDefined();
    expect(data.citations[0].snippet).toBeDefined();
  });

  // =========================================================================
  // TC-04: POST /api/router/chat (Smart Failover on HTTP 429)
  // =========================================================================
  test('TC-04: POST /api/router/chat - Smart Heuristic Failover saat provider utama 429 Rate Limit', async () => {
    const response = await request(app)
      .post('/api/router/chat')
      .send({
        workspace_id: testWorkspaceId,
        prompt: 'Analisis kegagalan jaringan pada sistem terdistribusi',
        model_target: 'gemini',
        options: {
          forceFailoverOnFirst: true
        }
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    const data = response.body.data;
    expect(data.fallback_triggered).toBe(true);
    expect(data.model_used).toBe('groq-llama-3.3-70b');
    expect(data.response_text).toBeDefined();
    expect(data.citations.length).toBeGreaterThan(0);
  });

  // =========================================================================
  // TC-05: POST /api/router/chat (9Router Bridge)
  // =========================================================================
  test('TC-05: POST /api/router/chat - Request chat via 9Router / OmniRoute Local Bridge (port 20128)', async () => {
    const response = await request(app)
      .post('/api/router/chat')
      .send({
        workspace_id: testWorkspaceId,
        prompt: 'Uji respons melalui proxy OpenAI-compatible lokal 9Router',
        model_target: '9router_local',
        options: {
          allowSimulatedBridge: true
        }
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    const data = response.body.data;
    expect(data.model_used).toBe('9router-local-omni');
    expect(data.response_text).toContain('9Router Local Bridge');
  });

  // =========================================================================
  // TC-06: GET /api/router/metrics
  // =========================================================================
  test('TC-06: GET /api/router/metrics - Rekapan penghematan biaya dan log token', async () => {
    const response = await request(app)
      .get('/api/router/metrics')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('berhasil dimuat');

    const data = response.body.data;
    expect(typeof data.total_queries).toBe('number');
    expect(data.total_queries).toBeGreaterThan(0);
    expect(data.prompt_tokens_total).toBeGreaterThan(0);
    expect(data.completion_tokens_total).toBeGreaterThan(0);
    expect(data.cost_saved_usd).toBeGreaterThan(0);
    expect(data.cost_saved_idr).toBeGreaterThan(0);
    expect(Array.isArray(data.active_providers)).toBe(true);
    expect(data.active_providers.some((p) => p.name === 'gemini')).toBe(true);
    expect(data.active_providers.some((p) => p.name === 'groq')).toBe(true);
  });
});

describe('🌐 Extended Coverage: Health, Workspaces CRUD, Documents & Helpers', () => {
  test('Health check endpoint returns healthy status', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data.database).toBe('connected');

    const resRoot = await request(app).get('/health').expect(200);
    expect(resRoot.body.success).toBe(true);
  });

  test('Workspaces CRUD flow', async () => {
    // 1. Create workspace
    const createRes = await request(app)
      .post('/api/workspaces')
      .send({ name: 'Proyek Riset AI', description: 'Koleksi paper machine learning' })
      .expect(201);
    expect(createRes.body.success).toBe(true);
    const wsId = createRes.body.data.id;

    // 2. Get list
    const listRes = await request(app).get('/api/workspaces').expect(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.length).toBeGreaterThan(0);

    // 3. Get single
    const singleRes = await request(app).get(`/api/workspaces/${wsId}`).expect(200);
    expect(singleRes.body.success).toBe(true);
    expect(singleRes.body.data.name).toBe('Proyek Riset AI');

    // 4. Delete workspace
    const deleteRes = await request(app).delete(`/api/workspaces/${wsId}`).expect(200);
    expect(deleteRes.body.success).toBe(true);

    // 5. Verify 404 after deletion
    await request(app).get(`/api/workspaces/${wsId}`).expect(404);
  });

  test('Workspaces validation errors', async () => {
    const emptyNameRes = await request(app)
      .post('/api/workspaces')
      .send({ name: '   ' })
      .expect(400);
    expect(emptyNameRes.body.error_code).toBe('VALIDATION_ERROR');

    const nonExistent = new mongoose.Types.ObjectId().toString();
    await request(app).delete(`/api/workspaces/${nonExistent}`).expect(404);
    await request(app).get(`/api/workspaces/${nonExistent}`).expect(404);
  });

  test('Documents listing and single detail', async () => {
    const listRes = await request(app).get('/api/documents').expect(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.length).toBeGreaterThan(0);

    const docId = listRes.body.data[0].id;
    const detailRes = await request(app).get(`/api/documents/${docId}`).expect(200);
    expect(detailRes.body.success).toBe(true);
    expect(detailRes.body.data.id).toBe(docId);

    const nonExistent = new mongoose.Types.ObjectId().toString();
    await request(app).get(`/api/documents/${nonExistent}`).expect(404);
  });

  test('Documents delete flow and 404', async () => {
    // Upload a temporary file
    const mdPath = path.join(__dirname, 'fixtures', 'Slide_Bab3_Distributed_Systems.md');
    const uploadRes = await request(app)
      .post('/api/documents/upload')
      .field('workspace_id', testWorkspaceId)
      .attach('file', mdPath)
      .expect(201);

    const tempDocId = uploadRes.body.data.id;

    // Delete it
    const delRes = await request(app).delete(`/api/documents/${tempDocId}`).expect(200);
    expect(delRes.body.success).toBe(true);

    // Verify 404
    await request(app).get(`/api/documents/${tempDocId}`).expect(404);

    const nonExistent = new mongoose.Types.ObjectId().toString();
    await request(app).delete(`/api/documents/${nonExistent}`).expect(404);
  });

  test('Router providers endpoints and validation', async () => {
    const listRes = await request(app).get('/api/router/providers').expect(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.length).toBeGreaterThan(0);

    const updateRes = await request(app)
      .post('/api/router/providers')
      .send({
        provider_name: 'gemini',
        base_url: 'https://generativelanguage.googleapis.com',
        priority: 1,
        is_active: true
      })
      .expect(201);
    expect(updateRes.body.success).toBe(true);

    // Missing provider_name
    await request(app).post('/api/router/providers').send({}).expect(400);
  });

  test('Chat endpoint validation for missing prompt', async () => {
    const res = await request(app).post('/api/router/chat').send({}).expect(400);
    expect(res.body.error_code).toBe('PROMPT_REQUIRED');
  });

  test('Unmatched API routes return 404', async () => {
    const res = await request(app).get('/api/unknown-endpoint').expect(404);
    expect(res.body.error_code).toBe('ENDPOINT_NOT_FOUND');
  });

  test('Global error handler catches thrown errors', async () => {
    const res = await request(app).get('/api/test-server-error').expect(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error_code).toBe('INTERNAL_SERVER_ERROR');
    expect(res.body.message).toBe('Simulated Internal Failure');
  });
});

describe('🔬 Unit Tests: documentParser & llmRouterService', () => {
  test('documentParser formatting & helpers', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(1073741824)).toBe('1 GB');

    const hash = calculateFileHash(Buffer.from('hello noteroute'));
    expect(typeof hash).toBe('string');
    expect(hash.length).toBe(64);

    expect(createSummary('')).toBe('Tidak ada konten teks yang dapat diekstrak.');
    expect(createSummary('Singkat')).toBe('Singkat');
    expect(createSummary('a'.repeat(300)).endsWith('...')).toBe(true);

    expect(createPreview('')).toBe('Pratinjau tidak tersedia.');
    expect(createPreview('Preview text')).toBe('Preview text');

    const chunks = chunkText('12345678901234567890', 10, 2);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunkText('')).toEqual([]);
  });

  test('documentParser findRelevantSnippet', () => {
    const text = 'Pendahuluan sistem terdistribusi. Teorema CAP sangat penting untuk konsistensi. Kesimpulan.';
    const snippet = findRelevantSnippet(text, 'Apa itu Teorema CAP?');
    expect(snippet.snippet).toContain('Teorema CAP');

    const emptySnippet = findRelevantSnippet('', 'apa');
    expect(emptySnippet.page).toBe(1);
  });

  test('documentParser extractText with DOCX', async () => {
    const docxPath = path.join(__dirname, 'fixtures', 'sample_lecture.docx');
    if (fs.existsSync(docxPath)) {
      const res = await extractText(
        docxPath,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'sample_lecture.docx'
      );
      expect(res.extractedText.length).toBeGreaterThan(0);
      expect(res.fileSize).toBeGreaterThan(0);
    }
  });

  test('llmRouterService token & cost estimators', () => {
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens('12345678')).toBe(2);

    const savings = calculateSavings(100000, 20000);
    expect(savings.costSavedUsd).toBeGreaterThan(0);
    expect(savings.costSavedIdr).toBeGreaterThan(0);
  });

  test('llmRouterService direct provider calls with axios mocks', async () => {
    // 1. Mock Gemini live response
    jest.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {
        candidates: [{ content: { parts: [{ text: 'Grounded Gemini Response' }] } }]
      }
    });
    const geminiLive = await callGemini('Test', 'System prompt', [], {
      geminiApiKey: 'test-key',
      geminiBaseUrl: 'https://test-gemini.com'
    });
    expect(geminiLive.responseText).toBe('Grounded Gemini Response');

    // 2. Mock Groq live response
    jest.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {
        choices: [{ message: { content: 'Groq Fast Llama Response' } }]
      }
    });
    const groqLive = await callGroq('Test', 'System prompt', [], {
      groqApiKey: 'test-groq-key',
      groqBaseUrl: 'https://test-groq.com'
    });
    expect(groqLive.responseText).toBe('Groq Fast Llama Response');

    // 3. Mock DeepSeek live response
    jest.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {
        choices: [{ message: { content: 'DeepSeek Reasoning Response' } }]
      }
    });
    const deepseekLive = await callDeepSeek('Test', 'System prompt', [], {
      deepseekApiKey: 'test-deepseek-key',
      deepseekBaseUrl: 'https://test-deepseek.com'
    });
    expect(deepseekLive.responseText).toBe('DeepSeek Reasoning Response');

    // 4. Mock 9Router live response
    jest.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {
        choices: [{ message: { content: '9Router Proxy Response' } }]
      }
    });
    const nineRouterLive = await call9RouterLocal('Test', 'System prompt', [], {
      nineRouterBaseUrl: 'http://localhost:20128/v1'
    });
    expect(nineRouterLive.responseText).toBe('9Router Proxy Response');
  });

  test('llmRouterService direct provider calls in test/offline fallback mode', async () => {
    const geminiRes = await callGemini('Test', '', [], { simulateOffline: true });
    expect(geminiRes.modelUsed).toBe('gemini-1.5-flash');

    const groqRes = await callGroq('Test', '', [], { simulateOffline: true });
    expect(groqRes.modelUsed).toBe('groq-llama-3.3-70b');

    const deepseekRes = await callDeepSeek('Test', '', [], { simulateOffline: true });
    expect(deepseekRes.modelUsed).toBe('deepseek-chat');

    const nineRouterRes = await call9RouterLocal('Test', '', [], { allowSimulatedBridge: true });
    expect(nineRouterRes.modelUsed).toBe('9router-local-omni');
  });

  test('routeChat with deepseek model target', async () => {
    const res = await routeChat({
      prompt: 'Analisis logika sistem terdistribusi',
      model_target: 'deepseek',
      documents: []
    });
    expect(res.model_used).toBe('deepseek-chat');
  });

  test('routeChat with all providers failure throws descriptive error', async () => {
    jest.spyOn(axios, 'post').mockRejectedValue(new Error('Network Down'));
    await expect(
      routeChat({
        prompt: 'Pertanyaan',
        model_target: 'gemini',
        documents: [],
        options: {
          simulateOffline: false,
          allowSimulatedBridge: false,
          forceFailoverOnFirst: false,
          geminiApiKey: 'test',
          groqApiKey: 'test',
          deepseekApiKey: 'test'
        }
      })
    ).rejects.toThrow('Semua AI provider gagal dihubungi');
  });

  test('getMetrics calculates metrics from TokenUsageLog', async () => {
    await TokenUsageLog.create({
      model_name: 'gemini-1.5-flash',
      prompt_tokens: 1500,
      completion_tokens: 200,
      latency_ms: 300,
      cost_saved_usd: 0.05,
      cost_saved_idr: 810
    });

    const metrics = await getMetrics();
    expect(metrics.total_queries).toBeGreaterThan(0);
    expect(metrics.prompt_tokens_total).toBeGreaterThan(0);
  });

  describe('🔐 Modul A: User Authentication & Profile (MongoDB Real)', () => {
    test('POST /api/auth/register - Registrasi user baru ke MongoDB', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Ahmad Zakky',
          email: 'zakky@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Ahmad Zakky');
      expect(res.body.data.email).toBe('zakky@example.com');
      expect(res.body.data.id).toBeDefined();
    });

    test('POST /api/auth/register - Tolak duplikasi email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Ahmad Zakky Duplicate',
          email: 'zakky@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error_code).toBe('EMAIL_ALREADY_EXISTS');
    });

    test('POST /api/auth/register - Validasi input kosong', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: '',
          email: ''
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error_code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/auth/login - Login sukses dengan kredensial valid', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'zakky@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('zakky@example.com');
    });

    test('POST /api/auth/login - Tolak password salah', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'zakky@example.com',
          password: 'SalahPassword123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error_code).toBe('INVALID_CREDENTIALS');
    });

    test('POST /api/auth/login - Tolak user tidak terdaftar', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'belumdaftar@example.com',
          password: 'Password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('POST /api/auth/login - Validasi input login kosong', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error_code).toBe('VALIDATION_ERROR');
    });

    test('GET /api/auth/me - Cek status profil', async () => {
      const resValid = await request(app)
        .get('/api/auth/me?email=zakky@example.com');
      expect(resValid.status).toBe(200);
      expect(resValid.body.data.email).toBe('zakky@example.com');

      const resGuest = await request(app).get('/api/auth/me');
      expect(resGuest.status).toBe(200);
      expect(resGuest.body.data.status).toBe('guest');
    });
  });
});
