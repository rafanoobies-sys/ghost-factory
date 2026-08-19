// Real fixer — calls Groq API if available, otherwise returns null.
// The CLI will fall back to the mock fixer when this returns null.

export async function realFix(code, errorMessage = '') {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    console.log('ℹ️  No GROQ_API_KEY found. Falling back to mock fixer.')
    return null
  }

  // Prepare the prompt for Groq
  const prompt = `You are GHOST, an expert AI debugger.
The following file content has a problem${errorMessage ? `: ${errorMessage}` : ''}.

\`\`\`
${code}
\`\`\`

Return the COMPLETE corrected file content. Do not add explanations. Do not wrap in markdown. Just the code.`

  const models = ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'qwen/qwen3.6-27b']

  for (const model of models) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 4096
        })
      })

      if (!response.ok) {
        const text = await response.text()
        console.warn(`⚠️  Groq error (${model}): ${response.status} ${text.slice(0, 100)}`)
        continue
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (content && content.trim().length > 0) {
        return content.trim()
      }
    } catch (err) {
      console.warn(`⚠️  Request failed for ${model}: ${err.message}`)
    }
  }

  console.error('❌ All Groq models failed. Falling back to mock fixer.')
  return null
}