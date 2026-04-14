import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client, Pool } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const CHAT_MESSAGES_FILE = path.join(DATA_DIR, "chat-messages.json");

export async function createStore() {
  const databaseUrl = String(process.env.DATABASE_URL || "").trim();

  if (databaseUrl) {
    const ssl = shouldUseSsl() ? { rejectUnauthorized: false } : undefined;
    if (shouldAutoCreateDatabase()) {
      await ensurePostgresDatabaseExists({ connectionString: databaseUrl, ssl });
    }

    const store = new PostgresStore({
      connectionString: databaseUrl,
      ssl,
    });
    await store.init();
    if (shouldMigrateFromFile()) {
      await migrateFileDataToPostgres(store);
    }
    return store;
  }

  const store = new FileStore();
  await store.init();
  return store;
}

function shouldUseSsl() {
  const raw = String(process.env.DATABASE_SSL || "").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

function shouldAutoCreateDatabase() {
  const raw = String(process.env.DATABASE_AUTO_CREATE || "true").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

function shouldMigrateFromFile() {
  const raw = String(process.env.MIGRATE_FILE_DATA || "true").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

class FileStore {
  constructor() {
    this.kind = "file";
  }

  async init() {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!existsSync(USERS_FILE)) {
      writeFileSync(USERS_FILE, "[]", "utf8");
    }

    if (!existsSync(CHAT_MESSAGES_FILE)) {
      writeFileSync(CHAT_MESSAGES_FILE, "{}", "utf8");
    }
  }

  async findUserByEmail(email) {
    const users = this.readUsers();
    return users.find((user) => user.email === email) || null;
  }

  async findUserById(id) {
    const users = this.readUsers();
    return users.find((user) => user.id === id) || null;
  }

  async createUser(user) {
    const users = this.readUsers();
    users.push(user);
    this.writeUsers(users);
    return user;
  }

  async getChatMessages(userId) {
    const chatStore = this.readChatStore();
    const messages = chatStore[userId];
    return Array.isArray(messages) ? messages : [];
  }

  async setChatMessages(userId, messages) {
    const chatStore = this.readChatStore();
    chatStore[userId] = messages;
    this.writeChatStore(chatStore);
    return messages;
  }

  async close() {}

  readUsers() {
    try {
      const raw = readFileSync(USERS_FILE, "utf8");
      const users = JSON.parse(raw);
      return Array.isArray(users) ? users : [];
    } catch {
      return [];
    }
  }

  writeUsers(users) {
    writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  }

  readChatStore() {
    try {
      const raw = readFileSync(CHAT_MESSAGES_FILE, "utf8");
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  writeChatStore(chatStore) {
    writeFileSync(CHAT_MESSAGES_FILE, JSON.stringify(chatStore, null, 2), "utf8");
  }
}

class PostgresStore {
  constructor(config) {
    this.kind = "postgres";
    this.pool = new Pool(config);
  }

  async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL
      );
    `);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        messages JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  async findUserByEmail(email) {
    const result = await this.pool.query(
      `SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );
    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  }

  async findUserById(id) {
    const result = await this.pool.query(
      `SELECT id, name, email, password_hash, created_at FROM users WHERE id = $1 LIMIT 1`,
      [id]
    );
    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  }

  async createUser(user) {
    await this.pool.query(
      `INSERT INTO users (id, name, email, password_hash, created_at) VALUES ($1, $2, $3, $4, $5)`,
      [user.id, user.name, user.email, user.passwordHash, user.createdAt]
    );
    return user;
  }

  async upsertUser(user) {
    await this.pool.query(
      `
      INSERT INTO users (id, name, email, password_hash, created_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
      `,
      [user.id, user.name, user.email, user.passwordHash, user.createdAt]
    );
  }

  async getChatMessages(userId) {
    const result = await this.pool.query(`SELECT messages FROM chat_messages WHERE user_id = $1 LIMIT 1`, [userId]);
    if (result.rowCount === 0) {
      return [];
    }

    const messages = result.rows[0]?.messages;
    return Array.isArray(messages) ? messages : [];
  }

  async setChatMessages(userId, messages) {
    await this.pool.query(
      `
      INSERT INTO chat_messages (user_id, messages, updated_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET messages = EXCLUDED.messages, updated_at = NOW()
      `,
      [userId, JSON.stringify(messages)]
    );

    return messages;
  }

  async close() {
    await this.pool.end();
  }
}

function mapUserRow(row) {
  return {
    id: row.id,
    name: row.name || "",
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

async function migrateFileDataToPostgres(store) {
  const users = readUsersFromFile();
  if (users.length === 0) {
    return;
  }

  const chatStore = readChatStoreFromFile();

  for (const sourceUser of users) {
    const user = normalizeStoredUser(sourceUser);
    if (!user) {
      continue;
    }

    try {
      await store.upsertUser(user);
      const dbUser = await store.findUserByEmail(user.email);
      if (!dbUser) {
        continue;
      }

      const sourceMessages = chatStore[user.id];
      if (!Array.isArray(sourceMessages) || sourceMessages.length === 0) {
        continue;
      }

      const existingMessages = await store.getChatMessages(dbUser.id);
      if (existingMessages.length > 0) {
        continue;
      }

      await store.setChatMessages(dbUser.id, sourceMessages);
    } catch (error) {
      console.warn("File-to-Postgres migration skipped one user:", user.email, error?.message || error);
    }
  }
}

function readUsersFromFile() {
  try {
    if (!existsSync(USERS_FILE)) {
      return [];
    }

    const raw = readFileSync(USERS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readChatStoreFromFile() {
  try {
    if (!existsSync(CHAT_MESSAGES_FILE)) {
      return {};
    }

    const raw = readFileSync(CHAT_MESSAGES_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeStoredUser(user) {
  const id = String(user?.id || "").trim();
  const email = String(user?.email || "").trim().toLowerCase();
  const passwordHash = String(user?.passwordHash || "").trim();

  if (!id || !email || !passwordHash) {
    return null;
  }

  const rawCreatedAt = String(user?.createdAt || "").trim();
  const createdAt = Number.isNaN(Date.parse(rawCreatedAt)) ? new Date().toISOString() : new Date(rawCreatedAt).toISOString();
  const name = String(user?.name || "").trim();

  return {
    id,
    name,
    email,
    passwordHash,
    createdAt,
  };
}

async function ensurePostgresDatabaseExists(config) {
  const targetDatabaseName = readDatabaseName(config.connectionString);
  if (!targetDatabaseName) {
    return;
  }

  const adminConnectionString = buildAdminConnectionString(config.connectionString);
  const adminClient = new Client({
    connectionString: adminConnectionString,
    ssl: config.ssl,
  });

  try {
    await adminClient.connect();
    const existsResult = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1 LIMIT 1`,
      [targetDatabaseName]
    );

    if (existsResult.rowCount > 0) {
      return;
    }

    const safeDbName = quoteIdentifier(targetDatabaseName);
    await adminClient.query(`CREATE DATABASE ${safeDbName}`);
    console.log(`Created PostgreSQL database: ${targetDatabaseName}`);
  } finally {
    try {
      await adminClient.end();
    } catch {
      // Ignore close errors.
    }
  }
}

function readDatabaseName(connectionString) {
  try {
    const url = new URL(connectionString);
    const pathname = String(url.pathname || "").replace(/^\//, "").trim();
    return pathname ? decodeURIComponent(pathname) : "";
  } catch {
    return "";
  }
}

function buildAdminConnectionString(connectionString) {
  const url = new URL(connectionString);
  url.pathname = "/postgres";
  return url.toString();
}

function quoteIdentifier(value) {
  return `"${String(value).replace(/"/g, "\"\"")}"`;
}
