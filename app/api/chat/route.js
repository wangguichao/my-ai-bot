import OpenAI from 'openai';

// 强制使用 Edge 运行时，速度更快
export const runtime = 'edge';

// 初始化 OpenAI 客户端 (适配 DeepSeek)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

export async function POST(req) {
  try {
    // 1. 获取前端发来的消息
    const { messages } = await req.json();

    // 2. 向 DeepSeek 发送请求
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat', // 确保模型名称正确
      stream: true,           // 开启流式输出
      messages: [
        { role: "system", content: "你是一个专业、有用的智能助手。" },
        ...messages
      ],
    });

    // 3. 将结果转换为流 (Stream) 返回给前端
    // 这里我们手动处理流，不再依赖可能会报错的外部库
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}