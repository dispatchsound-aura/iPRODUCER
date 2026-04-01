import { generateText } from "ai"
try {
  await generateText({ model: 'google/gemini-3-flash', prompt: "test" })
  console.log("Success")
} catch(e) { console.error("Error:", e.message) }
