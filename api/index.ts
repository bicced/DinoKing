import axios from "axios";
require('dotenv').config()

const OPENAI_API_KEY = process.env.CHAT_GPT_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function getChatGPTResponse(message: string) {
  const data = {
    model: "gpt-3.5-turbo", // or "gpt-3.5-turbo" if using GPT-3.5
    messages: [
      { role: "system", content: "Rate this joke with a number between 0 to 100, your response will be a tuple with rating and a creative response to it by the Dino King: example = {score: 95, message:'a custom response message'}" },
      { role: "user", content: message }
    ],
    max_tokens: 50,
    temperature: 0.7,
  };

  try {
    const response = await axios.post(OPENAI_API_URL, data, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const reply = response.data.choices[0].message.content;
    return reply;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}