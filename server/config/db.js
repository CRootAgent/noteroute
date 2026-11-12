const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

mongoose.set('bufferCommands', false);

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    document_count: { type: Number, default: 0 }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

workspaceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

const documentSchema = new mongoose.Schema(
  {
    workspace_id: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    file_path: { type: String, required: true },
    file_size: { type: Number, required: true },
    file_size_formatted: { type: String, required: true },
    mime_type: { type: String, required: true },
    file_hash: { type: String, default: '' },
    extracted_text: { type: String, default: '' },
    summary: { type: String, default: '' },
    preview_text: { type: String, default: '' }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

documentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

const aiEndpointSchema = new mongoose.Schema(
  {
    provider_name: {
      type: String,
      required: true,
      enum: ['gemini', 'groq', 'deepseek', '9router_local'],
      unique: true
    },
    base_url: { type: String, default: '' },
    api_key_encrypted: { type: String, default: '' },
    priority: { type: Number, default: 1 },
    is_active: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

aiEndpointSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

const chatSessionSchema = new mongoose.Schema(
  {
    workspace_id: { type: String, required: true, index: true },
    session_title: { type: String, default: 'New Chat Session' },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
        content: { type: String, required: true },
        citations: [
          {
            doc_id: { type: String },
            filename: { type: String },
            page: { type: Number, default: 1 },
            snippet: { type: String }
          }
        ],
        model_used: { type: String, default: '' },
        created_at: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

chatSessionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

const tokenUsageLogSchema = new mongoose.Schema(
  {
    model_name: { type: String, required: true },
    prompt_tokens: { type: Number, default: 0 },
    completion_tokens: { type: Number, default: 0 },
    latency_ms: { type: Number, default: 0 },
    cost_saved_usd: { type: Number, default: 0 },
    cost_saved_idr: { type: Number, default: 0 }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

tokenUsageLogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    avatar_url: { type: String, default: '' }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.password_hash;
  }
});

const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', workspaceSchema);
const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);
const AIEndpoint = mongoose.models.AIEndpoint || mongoose.model('AIEndpoint', aiEndpointSchema);
const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', chatSessionSchema);
const TokenUsageLog = mongoose.models.TokenUsageLog || mongoose.model('TokenUsageLog', tokenUsageLogSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

let isConnected = false;
let memoryServer = null;

async function seedDefaultData() {
  try {
    const wsCount = await Workspace.countDocuments();
    if (wsCount === 0) {
      const defaultWs = await Workspace.create({
        _id: '6727bd89f1a23b0012e84101',
        name: 'Materi Kuliah Semester 5',
        description: 'Slide kuliah, modul praktikum, dan riset',
        document_count: 2
      });

      const uploadsDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const samplePdfPath = path.join(uploadsDir, 'Slide_Bab3_Distributed_Systems.pdf');
      const sampleMdPath = path.join(uploadsDir, 'Catatan_Riset_LLM_Router.md');

      if (!fs.existsSync(samplePdfPath)) {
        fs.writeFileSync(samplePdfPath, 'Bab 3: Sistem Terdistribusi. Teorema CAP membuktikan ketidakmungkinan mencapai konsistensi kuat.');
      }
      if (!fs.existsSync(sampleMdPath)) {
        fs.writeFileSync(sampleMdPath, '# Riset LLM Router\nEvaluasi penghematan token menggunakan failover cerdas...');
      }

      await Document.create([
        {
          _id: '6727be01f1a23b0012e84102',
          workspace_id: defaultWs.id,
          filename: 'Slide_Bab3_Distributed_Systems.pdf',
          file_path: samplePdfPath,
          file_size: 2457600,
          file_size_formatted: '2.34 MB',
          mime_type: 'application/pdf',
          summary: 'Membahas arsitektur microservices, RPC, dan konsistensi data terdistribusi.',
          preview_text: 'Bab 3: Sistem Terdistribusi. Teorema CAP membuktikan ketidakmungkinan mencapai konsistensi kuat.',
          extracted_text: 'Bab 3: Sistem Terdistribusi. Teorema CAP membuktikan ketidakmungkinan mencapai konsistensi kuat secara bersamaan dengan ketersediaan penuh pada partisi jaringan.'
        },
        {
          _id: '6727be15f1a23b0012e84103',
          workspace_id: defaultWs.id,
          filename: 'Catatan_Riset_LLM_Router.md',
          file_path: sampleMdPath,
          file_size: 15420,
          file_size_formatted: '15.06 KB',
          mime_type: 'text/markdown',
          summary: 'Analisis perbandingan latensi antara Gemini 1.5 Flash dan Groq Llama 3.3.',
          preview_text: '# Riset LLM Router\nEvaluasi penghematan token menggunakan failover cerdas...',
          extracted_text: '# Riset LLM Router\nEvaluasi penghematan token menggunakan failover cerdas antara Google Gemini 1.5 Flash dan Groq Llama 3.3.'
        }
      ]);
    }
  } catch (e) {
    console.warn('[DB Seed] Seeding warning:', e.message);
  }
}

async function connectDB(uri) {
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = uri || process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      isConnected = true;
      await seedDefaultData();
      return conn;
    } catch (err) {
      console.warn(`[MongoDB] Atlas connection warning: ${err.message}. Starting MongoMemoryServer...`);
    }
  }

  // Fallback to MongoMemoryServer
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    const conn = await mongoose.connect(memUri);
    isConnected = true;
    console.log('✅ Connected to In-Memory MongoDB Server:', memUri);
    await seedDefaultData();
    return conn;
  } catch (memErr) {
    console.error('[MongoDB] Failed to start MongoMemoryServer:', memErr.message);
    return null;
  }
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  Workspace,
  Document,
  AIEndpoint,
  ChatSession,
  TokenUsageLog,
  User,
  mongoose
};