#!/usr/bin/env node

import { fixFile } from './factory/editor.js'
import { supabase } from './config/supabase.js'
import chokidar from 'chokidar'
import path from 'path'

const args = process.argv.slice(2)

// ----- HELP -----
if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
👻 GHOST — Self-healing debugger

Usage:
  ghost fix <file>                Fix errors in a file
  ghost watch [directory]         Watch a directory and auto‑fix changes (default: .)
  ghost memory show               Show recent stored fixes
  ghost memory clear              Delete all stored fixes (confirmation required)

Options:
  --help, -h                     Show this help
`)
  process.exit(0)
}

const command = args[0]

// ----- FIX -----
if (command === 'fix') {
  const filePath = args[1]
  if (!filePath) {
    console.error('❌ Please provide a file path.')
    process.exit(1)
  }
  const result = await fixFile(filePath)
  console.log(result ? '✅ GHOST fixed the file.' : '⚠️ GHOST could not fix the file.')
  process.exit(0)
}

// ----- WATCH -----
else if (command === 'watch') {
  const targetDir = args[1] || '.'
  console.log(`👻 GHOST is watching ${targetDir} for changes...`)

  // Debounce: ignore changes that happen right after GHOST writes a fix
  let lastFixTime = 0

  const watcher = chokidar.watch(targetDir, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
  })

  watcher.on('change', async (filePath) => {
    // Ignore changes that occur within 1 second of GHOST's own write
    const now = Date.now()
    if (now - lastFixTime < 1000) return

    // Only process common source files
    const ext = path.extname(filePath).toLowerCase()
    if (!['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs', '.java', '.c', '.cpp'].includes(ext)) {
      return
    }

    console.log(`📄 Change detected: ${filePath}`)
    const result = await fixFile(filePath)
    if (result) {
      console.log(`✅ GHOST fixed ${filePath}`)
      lastFixTime = Date.now()
    } else {
      console.log(`⚠️ GHOST could not fix ${filePath}`)
    }
  })

  console.log('✅ GHOST is watching. Press Ctrl+C to stop.')
  // Keep process alive
  process.stdin.resume()
  process.on('SIGINT', () => {
    console.log('\n👻 GHOST stopped watching.')
    process.exit(0)
  })
}

// ----- MEMORY -----
else if (command === 'memory') {
  const subCommand = args[1]

  if (subCommand === 'show') {
    const { data, error } = await supabase
      .from('ghost_memory')
      .select('error_message, fix_attempt, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('❌ Failed to fetch memory:', error.message)
      process.exit(1)
    }

    if (data.length === 0) {
      console.log('📭 No memory entries found.')
    } else {
      console.log('🧠 Recent GHOST Memory:')
      data.forEach((entry, i) => {
        console.log(`\n${i + 1}. Error: ${entry.error_message.slice(0, 80)}...`)
        console.log(`   Fix: ${entry.fix_attempt.slice(0, 80)}...`)
        console.log(`   Date: ${new Date(entry.created_at).toLocaleString()}`)
      })
    }
    process.exit(0)
  }

  else if (subCommand === 'clear') {
    const readline = await import('readline/promises')
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const answer = await rl.question('⚠️ Delete all stored fixes? Type "yes" to confirm: ')
    rl.close()

    if (answer.toLowerCase() === 'yes') {
      const { error } = await supabase.from('ghost_memory').delete().neq('id', 0)
      if (error) {
        console.error('❌ Failed to clear memory:', error.message)
        process.exit(1)
      }
      console.log('✅ Memory cleared.')
    } else {
      console.log('❌ Clear cancelled.')
    }
    process.exit(0)
  }

  else {
    console.error(`❌ Unknown memory subcommand: ${subCommand}. Use "show" or "clear".`)
    process.exit(1)
  }
}

// ----- UNKNOWN COMMAND -----
else {
  console.error(`❌ Unknown command: ${command}`)
  process.exit(1)
}