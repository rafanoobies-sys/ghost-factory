// fixFlow.js — reusable fix process for both `fix` and `watch`
import fs from 'fs/promises'
import { mockFix } from './fixer.mock.js'
import { realFix } from './fixer.js'
import { storeError } from './memory.js'

// Simple diff generator
function generateDiff(original, proposed) {
  const origLines = original.split('\n')
  const propLines = proposed.split('\n')
  const result = []
  const maxLen = Math.max(origLines.length, propLines.length)

  for (let i = 0; i < maxLen; i++) {
    const o = origLines[i]
    const p = propLines[i]
    if (o === p) {
      result.push(`  ${o}`)
    } else {
      if (o !== undefined) result.push(`- ${o}`)
      if (p !== undefined) result.push(`+ ${p}`)
    }
  }
  return result.join('\n')
}

// Ask yes/no in terminal
function askYesNo(question) {
  return new Promise((resolve) => {
    process.stdout.write(question + ' (y/n): ')
    process.stdin.once('data', (data) => {
      const answer = data.toString().trim().toLowerCase()
      resolve(answer === 'y' || answer === 'yes')
    })
  })
}

/**
 * Run the safe fix process on a file.
 * @param {string} filePath
 * @param {string} errorMessage - optional error description
 * @param {boolean} useMock - force mock fixer
 * @returns {Promise<boolean>} - true if a fix was applied, false otherwise
 */
export async function runFixFlow(filePath, errorMessage = '', useMock = false) {
  // 1. Read file
  let originalCode
  try {
    originalCode = await fs.readFile(filePath, 'utf-8')
  } catch (err) {
    console.error(`❌ Could not read file: ${filePath}`)
    console.error(err.message)
    return false
  }

  // 2. Get proposed fix
  let proposedCode
  if (useMock) {
    console.log('🔧 Using MOCK fixer (offline)...')
    proposedCode = await mockFix(originalCode)
  } else {
    console.log(`🔧 GHOST is analyzing ${filePath}...`)
    proposedCode = await realFix(originalCode, errorMessage)
    if (proposedCode === null) {
      console.log('🔄 Falling back to mock fixer...')
      proposedCode = await mockFix(originalCode)
    }
  }

  // 3. No changes?
  if (proposedCode === originalCode) {
    console.log('✅ No changes needed.')
    return false
  }

  // 4. Show diff
  console.log('\n--- DIFF ---')
  console.log(generateDiff(originalCode, proposedCode))
  console.log('--- END DIFF ---\n')

  // 5. Ask approval
  const approve = await askYesNo('Apply this fix?')
  if (!approve) {
    console.log('❌ Fix rejected. No files were changed.')
    return false
  }

  // 6. Write file
  try {
    await fs.writeFile(filePath, proposedCode, 'utf-8')
    console.log(`✅ GHOST fixed ${filePath}`)
  } catch (err) {
    console.error(`❌ Failed to write file: ${filePath}`)
    console.error(err.message)
    return false
  }

  // 7. Store in memory
  const error = new Error(`GHOST fixed ${filePath}${errorMessage ? ': ' + errorMessage : ''}`)
  error.stack = originalCode
  await storeError(error, proposedCode)
  console.log('🧠 Fix stored in local memory.')
  return true
}