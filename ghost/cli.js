#!/usr/bin/env node

import 'dotenv/config'
import path from 'path'
import chokidar from 'chokidar'
import { runFixFlow } from './core/fixFlow.js'
import { getRecentFixes, clearMemory } from './core/memory.js'

// --- Main CLI ---
const args = process.argv.slice(2)

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
👻 GHOST — Safe Self-Healing Debugger

Usage:
  ghost fix <file> [error_message] [--mock]   Fix errors in a file (shows diff, asks approval)
  ghost watch [directory] [--mock]            Watch a directory and run safe fix on changes
  ghost memory show                           Show recent fixes stored in local memory
  ghost memory clear                          Clear all stored fixes (asks for confirmation)

Options:
  --mock                                      Force mock fixer (offline, no API call)
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

  // Parse optional error message and --mock flag
  const restArgs = args.slice(2)
  const useMock = restArgs.includes('--mock')
  const errorMessage = restArgs.filter(a => a !== '--mock').join(' ')

  const success = await runFixFlow(filePath, errorMessage, useMock)
  process.exit(success ? 0 : 1)

} else if (command === 'watch') {
  const targetDir = args[1] || '.'
  const restArgs = args.slice(2)
  const useMock = restArgs.includes('--mock')
  const errorMessage = restArgs.filter(a => a !== '--mock').join(' ')

  console.log(`👻 GHOST is watching ${targetDir} for changes...`)
  if (useMock) console.log('🔧 Using MOCK fixer (offline).')
  console.log('Press Ctrl+C to stop.\n')

  let isFixing = false   // <-- ADD THIS

  const watcher = chokidar.watch(targetDir, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
  })

  watcher.on('change', async (filePath) => {
    // If GHOST is already fixing, ignore new change events (prevents loop)
    if (isFixing) return

    const ext = path.extname(filePath).toLowerCase()
    const allowed = ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs', '.java', '.c', '.cpp']
    if (!allowed.includes(ext)) return

        console.log(`\n📄 Change detected: ${filePath}`)
    isFixing = true
    const success = await runFixFlow(filePath, errorMessage, useMock)
    isFixing = false
    if (success) {
      console.log('✅ Done. Still watching for changes...')
    } else {
      console.log('ℹ️  No changes applied. Still watching for changes...')
    }
  })

  // Keep process alive
  process.stdin.resume()
  process.on('SIGINT', () => {
    console.log('\n👻 GHOST stopped watching.')
    watcher.close()
    process.exit(0)
  })

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
    process.exit(0)

  } else if (sub === 'clear') {
    const confirm = await new Promise((resolve) => {
      process.stdout.write('Are you sure you want to clear all fixes? (y/n): ')
      process.stdin.once('data', (data) => {
        const answer = data.toString().trim().toLowerCase()
        resolve(answer === 'y' || answer === 'yes')
      })
    })
    if (confirm) {
      await clearMemory()
      console.log('✅ Memory cleared.')
    } else {
      console.log('❌ Clear cancelled.')
    }
    process.exit(0)

  } else {
    console.log('Usage: ghost memory show|clear')
    process.exit(0)
  }

} else {
  console.error(`❌ Unknown command: ${command}`)
  console.log('Run `ghost --help` for usage.')
  process.exit(1)
}