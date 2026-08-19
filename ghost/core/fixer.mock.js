// Mock fixer — simulates an AI fix without any API calls.
// It takes the original code and returns a slightly modified version,
// just to exercise the review/approval flow.

export async function mockFix(code) {
  // Simulate a small "fix" by adding a comment line at the end.
  // This is obviously not a real fix, but it's enough to test the CLI.
  const proposed = code.replace(/\s*$/, '\n\n// GHOST mock fix: simulated correction\n')
  
  // Simulate a tiny delay like a real API would have.
  await new Promise(resolve => setTimeout(resolve, 200))

  return proposed
}