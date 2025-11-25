// app/api/chat/route.js
import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// 这里配置你的大模型服务商
// 如果你用的是国内的 DeepSeek / Moonshot / 阿里通义，需要改 baseURL
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1', 
});

export const runtime = 'edge'; // 让速度更快

export async function POST(req) {
  const { messages } = await req.json();

  // 向 AI 发送请求
  const response = await openai.chat.completions.create({
    model: 'deepseek-chat', // 或者 'gpt-4o', 'deepseek-chat'
    stream: true,
    messages: [
        { role: "system", content: "你是一个专业的数据分析助手，语气专业且有帮助。" },
        ...messages
    ],
  });

  // 把 AI 的回答变成流（打字机效果）传回给前端
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}