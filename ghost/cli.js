#!/usr/bin/env node

import fs from 'fs/promises'
import { mockFix } from './core/fixer.mock.js'
import { storeError, getRecentFixes, clearMemory } from './core/memory.js'

// --- Helper: generate a simple line-by-line diff ---
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

// --- Helper: ask a yes/no question ---
function askYesNo(question) {
  return new Promise((resolve) => {
    process.stdout.write(question + ' (y/n): ')
    process.stdin.once('data', (data) => {
      const answer = data.toString().trim().toLowerCase()
      resolve(answer === 'y' || answer === 'yes')
    })
  })
}

// --- Main CLI ---
const args = process.argv.slice(2)

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
👻 GHOST — Safe Self-Healing Debugger

Usage:
  ghost fix <file>          Fix errors in a file (shows diff, asks approval)
  ghost memory show         Show recent fixes stored in local memory
  ghost memory clear        Clear all stored fixes (asks for confirmation)
`)
  process.exit(0)
}

const command = args[0]

if (command === 'fix') {
  const filePath = args[1]
  if (!filePath) {
    console.error('❌ Please provide a file path.')
    process.exit(1)
  }

  // 1. Read the file
  let originalCode
  try {
    originalCode = await fs.readFile(filePath, 'utf-8')
  } catch (err) {
    console.error(`❌ Could not read file: ${filePath}`)
    console.error(err.message)
    process.exit(1)
  }

  // 2. Get proposed fix (mock for now)
  console.log(`🔧 GHOST is analyzing ${filePath}...`)
  const proposedCode = await mockFix(originalCode)

  // 3. Check if any change
  if (proposedCode === originalCode) {
    console.log('✅ No changes needed.')
    process.exit(0)
  }

  // 4. Show diff
  console.log('\n--- DIFF ---')
  console.log(generateDiff(originalCode, proposedCode))
  console.log('--- END DIFF ---\n')

  // 5. Ask for approval
  const approve = await askYesNo('Apply this fix?')

  if (!approve) {
    console.log('❌ Fix rejected. No files were changed.')
    process.exit(0)
  }

  // 6. Write the fix
  try {
    await fs.writeFile(filePath, proposedCode, 'utf-8')
    console.log(`✅ GHOST fixed ${filePath}`)
  } catch (err) {
    console.error(`❌ Failed to write file: ${filePath}`)
    console.error(err.message)
    process.exit(1)
  }

  // 7. Store in memory
  const error = new Error(`GHOST fixed ${filePath}`)
  error.stack = originalCode
  await storeError(error, proposedCode)
  console.log('🧠 Fix stored in local memory.')

} else if (command === 'memory') {
  const sub = args[1]

  if (sub === 'show') {
    const fixes = await getRecentFixes(10)
    if (fixes.length === 0) {
      console.log('🧠 No fixes in memory.')
    } else {
      console.log(`🧠 Recent fixes (${fixes.length}):\n`)
      fixes.forEach((f, i) => {
        console.log(`${i + 1}. [${f.created_at.slice(0, 10)}] ${f.error_message}`)
        if (f.fix_attempt) {
          const preview = f.fix_attempt.length > 80 ? f.fix_attempt.slice(0, 80) + '...' : f.fix_attempt
          console.log(`   Fix: ${preview}`)
        }
        console.log('')
      })
    }

  } else if (sub === 'clear') {
    const confirm = await askYesNo('Are you sure you want to clear all fixes?')
    if (confirm) {
      await clearMemory()
      console.log('✅ Memory cleared.')
    } else {
      console.log('❌ Clear cancelled.')
    }

  } else {
    console.log('Usage: ghost memory show|clear')
  }

} else {
  console.error(`❌ Unknown command: ${command}`)
  console.log('Run `ghost --help` for usage.')
  process.exit(1)
}