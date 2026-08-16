import { fixError } from './factory/fixer.js'

const testError = new Error('Test error for GHOST fixer')

const result = await fixError(testError)
console.log('Fixer result:', result)