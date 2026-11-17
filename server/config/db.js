const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

mongoose.set('bufferCommands', false);

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    document_count: { type: Number, default: 0 },
    user_id: { type: String, default: '', index: true }
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
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (e) {
    console.warn('[DB Init] Directory check warning:', e.message);
  }
}

async function connectDB(uri) {
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = uri || process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 6000 });
      isConnected = true;
      console.log('✅ Connected to MongoDB Atlas Cloud Database');
      await seedDefaultData();
      return conn;
    } catch (err) {
      console.error(`[MongoDB Atlas Error] ${err.message}`);
      if (process.env.NODE_ENV !== 'test') {
        throw err;
      }
    }
  }

  // Fallback to MongoMemoryServer strictly during automated tests (NODE_ENV === 'test')
  if (process.env.NODE_ENV === 'test') {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      isConnected = true;
      console.log('✅ Connected to In-Memory MongoDB Server (Test Mode):', memUri);
      await seedDefaultData();
      return conn;
    } catch (memErr) {
      console.error('[MongoDB] Failed to start MongoMemoryServer:', memErr.message);
      return null;
    }
  }

  throw new Error('MONGODB_URI is not configured in .env and NODE_ENV is not test');
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