const mongoose = require('mongoose');

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

const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', workspaceSchema);
const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);
const AIEndpoint = mongoose.models.AIEndpoint || mongoose.model('AIEndpoint', aiEndpointSchema);
const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', chatSessionSchema);
const TokenUsageLog = mongoose.models.TokenUsageLog || mongoose.model('TokenUsageLog', tokenUsageLogSchema);

let isConnected = false;

async function connectDB(uri) {
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/noteroute';
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    return conn;
  } catch (err) {
    console.warn(`[MongoDB] Connection warning (${mongoUri}): ${err.message}`);
    return null;
  }
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
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
  mongoose
};
