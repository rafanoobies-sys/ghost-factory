import { storeError, getSimilarError } from './memory.js'

export async function watchError(error) {
  console.log('👻 GHOST detected an error:', error.message)
  
  const similar = await getSimilarError(error)
  if (similar) {
    console.log('🧠 Remembered fix:', similar.fix_attempt)
    return similar
  } else {
    console.log('🆕 New error — storing for future reference')
    await storeError(error, 'No fix yet — will learn from this')
    return null
  }
}