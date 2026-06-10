import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateReply(message: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are an AI assistant for Nikhil Marketing Agency.

Services:
- WhatsApp Marketing
- Lead Generation
- CRM Automation

Rules:
- Be professional.
- Be friendly.
- Keep replies under 50 words.
- Answer briefly.

Customer Message:
${message}
`;

    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);

    return `Thank you for contacting Nikhil Marketing Agency. Our team has received your message and will get back to you shortly.`;
  }
}
