import { supabase } from '../config/supabase.js'

const GROQ_API_KEY = process.env.GROQ_API_KEY

export async function debugError(error, similarFix) {
  if (similarFix && similarFix.fix_attempt && similarFix.fix_attempt !== 'No fix yet — will learn from this') {
    return similarFix.fix_attempt
  }

  const prompt = `You are GHOST, an AI debugger. 
The following error occurred:
${error.message}
Stack trace:
${error.stack || 'No stack trace available'}

Suggest a fix for this error. Be concise. Return only the fix description.`

  const models = ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'qwen/qwen3.6-27b']

  for (const model of models) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 200
        })
      })

      if (!response.ok) {
        const text = await response.text()
        console.error(`Groq error (${model}):`, response.status, text)
        continue
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      if (content && content.length > 10) {
        return content
      }
    } catch (e) {
      console.error(`Request failed for ${model}:`, e)
    }
  }

  return 'No fix generated'
}