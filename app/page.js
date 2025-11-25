'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, MessageSquare, Settings, Bot, Sparkles, User, Paperclip, Mic, Trash2 } from 'lucide-react';

// 生成唯一ID的小工具
const generateId = () => Math.random().toString(36).substr(2, 9);

const AgentInterface = () => {
  // --- 状态管理 ---
  const [sessions, setSessions] = useState([]); // 所有会话
  const [currentSessionId, setCurrentSessionId] = useState(null); // 当前选中会话ID
  const [messages, setMessages] = useState([]); // 当前显示的消息
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // --- 1. 初始化：从浏览器缓存读取历史 ---
  useEffect(() => {
    const savedSessions = localStorage.getItem('chat_sessions');
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions);
      setSessions(parsedSessions);
      if (parsedSessions.length > 0) {
        // 如果有历史，默认选中第一个
        setCurrentSessionId(parsedSessions[0].id);
        setMessages(parsedSessions[0].messages);
      } else {
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // --- 2. 辅助函数：保存到本地 ---
  const saveSessionsToLocal = (updatedSessions) => {
    setSessions(updatedSessions);
    localStorage.setItem('chat_sessions', JSON.stringify(updatedSessions));
  };

  // --- 3. 新建对话 ---
  const createNewChat = () => {
    const newId = generateId();
    const newSession = {
      id: newId,
      title: "新对话",
      date: new Date().toLocaleDateString(),
      messages: [{ 
        id: generateId(), 
        role: 'ai', // 前端显示用 'ai' 没问题，发请求时再转
        content: '你好！我是你的全能 AI 助手。请问今天想做什么？' 
      }]
    };
    const updatedSessions = [newSession, ...sessions];
    saveSessionsToLocal(updatedSessions);
    setCurrentSessionId(newId);
    setMessages(newSession.messages);
  };

  // --- 4. 切换会话 ---
  const switchSession = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
    }
  };

  // --- 5. 删除会话 ---
  const deleteSession = (e, sessionId) => {
    e.stopPropagation();
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    saveSessionsToLocal(updatedSessions);
    if (sessionId === currentSessionId) {
      if (updatedSessions.length > 0) {
        setCurrentSessionId(updatedSessions[0].id);
        setMessages(updatedSessions[0].messages);
      } else {
        createNewChat();
      }
    }
  };

  // --- 6. 发送消息 (整合了你的修复 + 历史记录保存) ---
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // A. 界面立即显示用户消息
    const userMsg = { id: generateId(), role: 'user', content: inputValue };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    // B. 更新历史记录标题 (如果是第一句)
    let updatedSessions = sessions.map(session => {
      if (session.id === currentSessionId) {
        const newTitle = session.messages.length <= 1 ? userMsg.content.slice(0, 10) + "..." : session.title;
        return { ...session, messages: newMessages, title: newTitle };
      }
      return session;
    });
    saveSessionsToLocal(updatedSessions);

    try {
      // C. 发送请求 (应用了你的修复: role 转换)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          // ★★★ 这里是你刚才修复的关键代码 ★★★
          messages: newMessages.map(m => ({ 
            role: m.role === 'ai' ? 'assistant' : m.role, 
            content: m.content 
          })) 
        }),
      });

      if (!response.ok) throw new Error(response.statusText);

      // D. 处理流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';
      
      // 创建一个空的 AI 消息占位
      const aiMsgId = generateId();
      setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        aiContent += text;
        
        // 实时更新 UI 上的最后一条消息
        setMessages(prev => {
           const newMsgs = [...prev];
           // 确保我们在更新刚才添加的那条 AI 消息
           const lastMsg = newMsgs[newMsgs.length - 1];
           if (lastMsg.role === 'ai') {
             lastMsg.content = aiContent;
           }
           return newMsgs;
        });
      }

      // E. 对话结束，把完整的 AI 回复存入 LocalStorage
      updatedSessions = sessions.map(session => {
        if (session.id === currentSessionId) {
          return { 
            ...session, 
            messages: [...session.messages, { id: aiMsgId, role: 'ai', content: aiContent }] 
          };
        }
        return session;
      });
      saveSessionsToLocal(updatedSessions);

    } catch (error) {
      console.error("Error:", error);
      const errorMsg = { id: generateId(), role: 'ai', content: '出错了，请检查网络连接或 API Key。' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
      
      {/* 侧边栏 */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 hidden md:flex transition-all duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-slate-700">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Bot size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-wide">Nexus Agent</span>
        </div>

        <div className="p-4">
          <button 
            onClick={createNewChat} 
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl transition-all shadow-lg shadow-blue-900/50 font-medium active:scale-95"
          >
            <Plus size={18} />
            <span>新建对话</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">History</div>
          <ul className="space-y-2">
            {sessions.map((session) => (
              <li 
                key={session.id} 
                onClick={() => switchSession(session.id)}
                className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors relative ${
                  currentSessionId === session.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <MessageSquare size={16} className={currentSessionId === session.id ? 'text-blue-400' : 'text-slate-500'} />
                <span className="text-sm truncate pr-6">{session.title}</span>
                <button 
                  onClick={(e) => deleteSession(e, session.id)}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
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
            </div>
            <Settings size={16} className="ml-auto" />
          </button>
        </div>
      </aside>

      {/* 主区域 */}
      <main className="flex-1 flex flex-col h-full relative">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-md">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-800">DeepSeek 智能助手</h2>
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
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-slate-200' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'}`}>
                  {msg.role === 'user' ? <User size={16} className="text-slate-500"/> : <Bot size={16} />}
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                     <Bot size={16} />
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
                rows={1}
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
              内容由 AI 生成，请注意甄别。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentInterface;