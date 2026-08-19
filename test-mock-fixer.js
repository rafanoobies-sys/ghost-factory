import { mockFix } from './ghost/core/fixer.mock.js'

const original = 'console.log("hello")\n'
const proposed = await mockFix(original)

console.log('Original:', original.trim())
console.log('Proposed:', proposed.trim())