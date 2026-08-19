import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

// The local memory file path. It will be stored in the project root.
const MEMORY_FILE = path.join(process.cwd(), '.ghost-memory.json')

// Default empty memory structure.
const emptyMemory = () => ({ fixes: [] })

// Read the memory file. If it doesn't exist, return empty memory.
async function loadMemory() {
  try {
    const raw = await fs.readFile(MEMORY_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return parsed && Array.isArray(parsed.fixes) ? parsed : emptyMemory()
  } catch (err) {
    if (err.code === 'ENOENT') {
      // File doesn't exist yet, that's okay.
      return emptyMemory()
    }
    // Some other error, log and return empty.
    console.error('GHOST memory load failed:', err)
    return emptyMemory()
  }
}

// Write the memory object to disk.
async function saveMemory(memory) {
  try {
    await fs.writeFile(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf-8')
  } catch (err) {
    console.error('GHOST memory save failed:', err)
  }
}

// Generate a unique hash for an error (message + stack trace).
export function hashError(error) {
  const hash = crypto.createHash('sha256')
  hash.update(error.message || '')
  hash.update(error.stack || '')
  return hash.digest('hex')
}

// Store an error and its fix in local memory.
export async function storeError(error, fix) {
  const memory = await loadMemory()
  const errorHash = hashError(error)

  // Find if this exact error already exists.
  const existingIndex = memory.fixes.findIndex(entry => entry.error_hash === errorHash)

  const entry = {
    error_hash: errorHash,
    error_message: error.message || 'Unknown error',
    stack_trace: error.stack || null,
    fix_attempt: fix || null,
    success: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (existingIndex >= 0) {
    // Update existing entry, but keep original created_at.
    entry.created_at = memory.fixes[existingIndex].created_at
    memory.fixes[existingIndex] = entry
  } else {
    // Add new entry.
    memory.fixes.push(entry)
  }

  await saveMemory(memory)
  return entry
}

// Retrieve a remembered fix for the exact same error (if any).
export async function getSimilarError(error) {
  const memory = await loadMemory()
  const errorHash = hashError(error)

  const found = memory.fixes.find(entry => entry.error_hash === errorHash)
  return found || null
}

// Optional: show recent fixes (useful for `ghost memory show` later).
export async function getRecentFixes(limit = 10) {
  const memory = await loadMemory()
  return memory.fixes
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, limit)
}

// Optional: clear all fixes (for `ghost memory clear`).
export async function clearMemory() {
  await saveMemory(emptyMemory())
  return true
}