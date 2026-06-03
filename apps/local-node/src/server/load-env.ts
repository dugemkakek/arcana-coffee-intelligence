// Load .env from the repo root as a module-init side effect.
//
// This must be imported BEFORE any other module that reads process.env.
// ESM hoists imports, so this file's body runs before its importer's
// remaining imports are evaluated — but only if it has no transitive
// dependencies that themselves read process.env.
//
// dotenv does not override pre-set env vars, so production deployments
// that inject real env vars are unaffected.

import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../../../.env') });
