import fs from 'fs/promises'
import { debugError } from './debugger.js'
import { storeError, getSimilarError } from './memory.js'

export async function fixFile(filePath) {
  console.log(`📄 Reading file: ${filePath}`)
  const code = await fs.readFile(filePath, 'utf-8')

  const error = new Error(`Fixing code in ${filePath}`)
  error.stack = code

  const similar = await getSimilarError(error)
  let fix = similar?.fix_attempt

  // Skip bad fixes
  if (fix && (fix === 'No fix generated' || fix === 'No fix yet — will learn from this')) {
    fix = null
  }

  if (!fix) {
    console.log('🧠 No fix in memory. Asking Groq...')
    fix = await debugError(error, similar)
    console.log('💡 Suggested fix:', fix)

    // Only store if it's a valid fix (not "No fix generated")
    if (fix && fix !== 'No fix generated' && fix.length > 10) {
      await storeError(error, fix)
    } else {
      console.warn('⚠️ No valid fix generated, skipping memory store.')
    }
  } else {
    console.log('🧠 Using remembered fix:', fix)
  }

  if (fix && fix !== 'No fix generated' && fix.length > 10) {
    await fs.writeFile(filePath, fix, 'utf-8')
    console.log('✅ Fixed file written:', filePath)
    return true
  } else {
    console.log('⚠️ No fix applied.')
    return false
  }
}