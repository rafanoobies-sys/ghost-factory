import { storeError, getSimilarError } from './memory.js'
import { debugError } from './debugger.js'

export async function fixError(error) {
  console.log('🔧 GHOST is fixing error:', error.message)

  const similar = await getSimilarError(error)
  let fix = similar?.fix_attempt

  if (!fix || fix === 'No fix yet — will learn from this') {
    console.log('🧠 No fix in memory. Asking Groq...')
    fix = await debugError(error, similar)
    console.log('💡 Suggested fix:', fix)
  } else {
    console.log('🧠 Using remembered fix:', fix)
  }

  await storeError(error, fix)
  return fix
}