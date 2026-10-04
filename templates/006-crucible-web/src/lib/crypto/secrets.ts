import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

// AES-256-GCM encryption for per-company third-party credentials
// (Publora API key, Apify token, Pixfaro token) stored in
// `company_credentials`. See /Users/aak/.claude/plans/can-we-make-this-snappy-adleman.md
// for why app-level encryption was chosen over pgcrypto: the worker needs
// plaintext in memory anyway to inject into a subprocess env, so decrypting
// inside Postgres would just ship the plaintext back over the wire regardless.
//
// CREDENTIALS_ENC_KEY must be a 32-byte key, base64-encoded (44 chars).
// Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
// Rotate by re-encrypting all rows with a new key — this module intentionally
// does not implement key versioning; add it if/when rotation is needed.

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12; // 96-bit IV is the GCM-recommended size

function getKey(): Buffer {
  const raw = process.env.CREDENTIALS_ENC_KEY;
  if (!raw) {
    throw new Error(
      'CREDENTIALS_ENC_KEY is not set — required to encrypt/decrypt company credentials. ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"'
    );
  }
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error(`CREDENTIALS_ENC_KEY must decode to exactly 32 bytes, got ${key.length}`);
  }
  return key;
}

export interface EncryptedField {
  enc: string; // ciphertext, base64
  iv: string; // base64
  tag: string; // GCM auth tag, base64
}

/** Encrypt one secret value (an API key/token). Returns null for null/undefined input
 * so callers can round-trip "field not set" without a placeholder ciphertext. */
export function encryptSecret(plaintext: string | null | undefined): EncryptedField | null {
  if (plaintext == null || plaintext === '') return null;
  const key = getKey();
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { enc: enc.toString('base64'), iv: iv.toString('base64'), tag: tag.toString('base64') };
}

/** Decrypt one secret value. Returns null if any of enc/iv/tag is missing
 * (the field was never set) rather than throwing. Throws on tampered/corrupt
 * ciphertext (GCM auth-tag mismatch) — never fail open. */
export function decryptSecret(field: Partial<EncryptedField> | null | undefined): string | null {
  if (!field?.enc || !field.iv || !field.tag) return null;
  const key = getKey();
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(field.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(field.tag, 'base64'));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(field.enc, 'base64')),
    decipher.final(),
  ]);
  return dec.toString('utf8');
}

/** Row shape as stored in/read from `company_credentials`. */
export interface CompanyCredentialsRow {
  publora_api_key_enc: string | null;
  publora_api_key_iv: string | null;
  publora_api_key_tag: string | null;
  linkedin_platform_id: string | null; // not secret, stored plain
  apify_token_enc: string | null;
  apify_token_iv: string | null;
  apify_token_tag: string | null;
  pixfaro_token_enc: string | null;
  pixfaro_token_iv: string | null;
  pixfaro_token_tag: string | null;
}

export interface CompanyCredentialsPlain {
  publoraApiKey: string | null;
  linkedinPlatformId: string | null;
  apifyToken: string | null;
  pixfaroToken: string | null;
}

/** Encrypt a full plaintext credentials object into the row shape the
 * `company_credentials` table expects (spread the result into an upsert). */
export function encryptCompanyCredentials(
  plain: Partial<CompanyCredentialsPlain>
): Partial<CompanyCredentialsRow> {
  const publora = encryptSecret(plain.publoraApiKey);
  const apify = encryptSecret(plain.apifyToken);
  const pixfaro = encryptSecret(plain.pixfaroToken);
  return {
    ...(publora && {
      publora_api_key_enc: publora.enc,
      publora_api_key_iv: publora.iv,
      publora_api_key_tag: publora.tag,
    }),
    ...(plain.linkedinPlatformId !== undefined && {
      linkedin_platform_id: plain.linkedinPlatformId,
    }),
    ...(apify && {
      apify_token_enc: apify.enc,
      apify_token_iv: apify.iv,
      apify_token_tag: apify.tag,
    }),
    ...(pixfaro && {
      pixfaro_token_enc: pixfaro.enc,
      pixfaro_token_iv: pixfaro.iv,
      pixfaro_token_tag: pixfaro.tag,
    }),
  };
}

/** Decrypt a full `company_credentials` row back to plaintext. Only ever call
 * this server-side (the worker, or an API route using the service-role
 * client) — never expose the encrypted or decrypted row to a browser client. */
export function decryptCompanyCredentials(row: CompanyCredentialsRow): CompanyCredentialsPlain {
  return {
    publoraApiKey: decryptSecret({
      enc: row.publora_api_key_enc ?? undefined,
      iv: row.publora_api_key_iv ?? undefined,
      tag: row.publora_api_key_tag ?? undefined,
    }),
    linkedinPlatformId: row.linkedin_platform_id,
    apifyToken: decryptSecret({
      enc: row.apify_token_enc ?? undefined,
      iv: row.apify_token_iv ?? undefined,
      tag: row.apify_token_tag ?? undefined,
    }),
    pixfaroToken: decryptSecret({
      enc: row.pixfaro_token_enc ?? undefined,
      iv: row.pixfaro_token_iv ?? undefined,
      tag: row.pixfaro_token_tag ?? undefined,
    }),
  };
}

/** Mask a secret for display in the UI (e.g. "pf_live_••••••••cd1f"). Never
 * send full decrypted values to the client — the credentials GET route
 * should call this, not decryptCompanyCredentials, when returning to the browser. */
export function maskSecret(plaintext: string | null): string | null {
  if (!plaintext) return null;
  if (plaintext.length <= 8) return '••••••••';
  return `${plaintext.slice(0, 4)}${'•'.repeat(8)}${plaintext.slice(-4)}`;
}
