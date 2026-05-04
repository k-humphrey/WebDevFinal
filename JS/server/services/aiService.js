require('dotenv').config()

const { GoogleGenAI } = require('@google/genai')

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

async function reviseResumeContent(input) {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error('GEMINI_API_KEY is not configured.')
    error.statusCode = 503
    throw error
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const prompt = buildRevisionPrompt(input)

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt
  })

  const revisedText = String(response.text || '').trim()
  if (!revisedText) {
    const error = new Error('AI returned an empty revision.')
    error.statusCode = 502
    throw error
  }

  return revisedText
}

function buildRevisionPrompt(input) {
  const content = htmlToPlainText(input.content)

  return `
You are improving one resume ingredient for a ${input.occupation || 'job'} application.
Ingredient type: ${input.typeName}
Title: ${input.title}

Rewrite the content into concise, ATS-friendly resume bullets.
Rules:
- Return only the revised bullets.
- Use strong action verbs.
- Preserve truthful details from the user.
- Do not invent employers, dates, tools, degrees, or metrics.
- If metrics are missing, improve clarity without adding fake numbers.

User content:
${content}
`.trim()
}

function htmlToPlainText(value) {
  return String(value || '')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
}

module.exports = {
  buildRevisionPrompt,
  htmlToPlainText,
  reviseResumeContent
}
