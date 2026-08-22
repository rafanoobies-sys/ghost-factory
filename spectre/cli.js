#!/usr/bin/env node

import { buildProject } from './core/builder.js'

const args = process.argv.slice(2)

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
👤 SPECTRE — Builder Agent

Usage:
  node spectre/cli.js build <type> <name>

Types:
  landing-page   Create a landing page scaffold
  portfolio      Create a portfolio scaffold
  dashboard      Create a dashboard scaffold
  contact-form   Create a contact form scaffold
  blog           Create a blog scaffold
  api-starter    Create a Node.js API starter
  automation     Create an automation script scaffold
  pricing        Create a pricing page
  faq            Create an FAQ page
  coming-soon    Create a coming soon page
  bio-link       Create a link-in-bio page
  documentation  Create a documentation page
`)
  process.exit(0)
}

const command = args[0]

if (command === 'build') {
  const type = args[1]
  const name = args.slice(2).join(' ')
  await buildProject(type, name)
} else {
  console.log('Unknown command. Run with --help for usage.')
}