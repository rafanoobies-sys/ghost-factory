import { supabase } from '../config/supabase.js'
import crypto from 'crypto'

export function hashError(error) {
  const hash = crypto.createHash('sha256')
  hash.update(error.message + (error.stack || ''))
  return hash.digest('hex')
}

export async function storeError(error, fix) {
  const errorHash = hashError(error)
  const { data, error: dbError } = await supabase
    .from('ghost_memory')
    .upsert({
      error_hash: errorHash,
      error_message: error.message,
      stack_trace: error.stack || null,
      fix_attempt: fix || null,
      success: false,
      attempts: 1
    }, {
      onConflict: 'error_hash'
    })
    .select()
  
  if (dbError) console.error('Memory store failed:', dbError)
  return data?.[0] || null
}

export async function getSimilarError(error) {
  const errorHash = hashError(error)
  const { data, error: dbError } = await supabase
    .from('ghost_memory')
    .select('*')
    .eq('error_hash', errorHash)
    .order('created_at', { ascending: false })
    .limit(1)
  
  if (dbError) console.error('Memory fetch failed:', dbError)
  return data?.[0] || null
}