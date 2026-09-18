import { GoogleGenerativeAI } from "@google/generative-ai"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  throw new Error("Please define GEMINI_API_KEY in .env.local")
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
})

export async function generateAIResponse(
  prompt: string
) {
  const result = await model.generateContent(prompt)

  return result.response.text()
}