'use client';  // <--- 必须加这行，否则会报错！

import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, MessageSquare, Settings, Bot, Sparkles, User, Paperclip, Mic } from 'lucide-react';
// 如果你没有安装 ai 库，可以用原生 fetch，但在上一步教程中我们安装了 ai 库，这里保留使用
// 为了防止新手报错，这里我改写为最通用的 fetch 写法，确保 100% 能跑
// import { useChat } from 'ai/react'; 

const AgentInterface = () => {
  // 模拟的历史对话数据
  const history = [
    { id: 1, title: "分析 Q3 财务报表", date: "今天" },
    { id: 2, title: "生成 Python 爬虫代码", date: "昨天" },
    { id: 3, title: "翻译技术文档 (中英)", date: "过去 7 天" },
  ];

  // 消息列表状态
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', content: '你好！我是你的全能 AI 助手。请问今天想做什么？' }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // 发送消息处理函数
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // 1. 立即显示用户消息
    const userMsg = { id: Date.now(), role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // 2. 发送请求给后端
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMsg].map(m => ({ 
            role: m.role === 'ai' ? 'assistant' : m.role,  // <--- 关键修改在这里！
            content: m.content 
          })) 
        }),
      });

      if (!response.ok) throw new Error(response.statusText);

      // 3. 处理流式响应 (让字一个个蹦出来)
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseText = '';
      
      // 先放一个空的 AI 消息占位
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        aiResponseText += chunk;
        
        // 实时更新最后一条消息的内容
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].content = aiResponseText;
          return newMsgs;
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { id: Date.now() + 2, role: 'ai', content: '抱歉，出错了，请检查网络或 API Key 设置。' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
      
      {/* --- 左侧：历史对话 (Sidebar) --- */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-slate-700">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Bot size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-wide">Nexus Agent</span>
        </div>

        <div className="p-4">
          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl transition-all shadow-lg shadow-blue-900/50 font-medium">
            <Plus size={18} />
            <span>新建对话</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">History</div>
          <ul className="space-y-2">
            {history.map((item) => (
              <li key={item.id} className="group flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors text-slate-300 hover:text-white">
                <MessageSquare size={16} className="text-slate-500 group-hover:text-blue-400" />
                <span className="text-sm truncate">{item.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 border-t border-slate-700">
          <button className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full p-2 rounded-lg hover:bg-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">User Name</span>
              <span className="text-xs text-slate-500">Pro Plan</span>
            </div>
            <Settings size={16} className="ml-auto" />
          </button>
        </div>
      </aside>

      {/* --- 右侧：主区域 --- */}
      <main className="flex-1 flex flex-col h-full relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-800">DeepSeek 智能助手</h2>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                在线 · 深度思考模式
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-white">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] md:max-w-[70%] gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-slate-200' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'}`}>
                  {msg.role === 'user' ? <User size={20} className="text-slate-500"/> : <Bot size={20} />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-slate-100 text-slate-800 rounded-tr-none' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
             <div className="flex w-full justify-start">
                <div className="flex max-w-[80%] gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                     <Bot size={20} />
                  </div>
                  <div className="flex items-center gap-1 p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-sm">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border-t border-slate-100 p-6">
          <div className="max-w-4xl mx-auto relative">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-inner focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all overflow-hidden">
              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="输入你想问的问题..."
                className="w-full bg-transparent p-4 min-h-[60px] max-h-[200px] outline-none resize-none text-slate-700 placeholder:text-slate-400"
                rows={2}
              />
              <div className="flex justify-between items-center px-4 pb-3 pt-1">
                <div className="flex gap-2 text-slate-400">
                   <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors"><Paperclip size={18} /></button>
                   <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors"><Mic size={18} /></button>
                </div>
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className={`p-2 rounded-xl transition-all ${
                    inputValue.trim() && !isTyping
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 hover:bg-blue-700' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-slate-400 mt-3">
              DeepSeek AI 生成的内容可能存在误差。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentInterface;