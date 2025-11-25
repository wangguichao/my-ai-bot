import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, MessageSquare, Settings, Bot, Sparkles, User, Paperclip, Mic } from 'lucide-react';

const AgentInterface = () => {
  // 模拟的历史对话数据
  const history = [
    { id: 1, title: "分析 Q3 财务报表", date: "今天" },
    { id: 2, title: "生成 Python 爬虫代码", date: "昨天" },
    { id: 3, title: "翻译技术文档 (中英)", date: "过去 7 天" },
  ];

  // 模拟的对话内容
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', content: '你好！我是你的全能 AI 助手。我可以帮你处理数据、编写代码或进行创意写作。请问今天想做什么？' }
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

    // 1. 添加用户消息
    const userMsg = { id: Date.now(), role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // TODO: 这里是调用大模型接口的地方 (下文详细解释)
    
    // 模拟 AI 回复延迟
    setTimeout(() => {
      const aiMsg = { id: Date.now() + 1, role: 'ai', content: '这是一个模拟的回复。在实际对接中，这里会显示大模型生成的答案。' };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
      
      {/* --- 左侧：历史对话 (Sidebar) --- */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 transition-all duration-300">
        {/* App Logo / Title */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-700">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Bot size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-wide">Nexus Agent</span>
        </div>

        {/* 新建对话按钮 */}
        <div className="p-4">
          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl transition-all shadow-lg shadow-blue-900/50 font-medium">
            <Plus size={18} />
            <span>新建对话</span>
          </button>
        </div>

        {/* 历史列表 */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 custom-scrollbar">
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

        {/* 底部设置 */}
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
        
        {/* 1. 顶部：AI组件/功能介绍区 (Header) */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-800">高级数据分析助手</h2>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                GPT-4o 模型已连接 · 支持联网搜索
              </p>
            </div>
          </div>
          
          {/* 右侧工具栏 (可选) */}
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors">
              查看插件
            </button>
            <button className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors">
              导出记录
            </button>
          </div>
        </header>


        {/* 2. 中部：主对话区 (Chat Area) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-white">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] md:max-w-[70%] gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* 头像 */}
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-slate-200' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'}`}>
                  {msg.role === 'user' ? <User size={20} className="text-slate-500"/> : <Bot size={20} />}
                </div>

                {/* 气泡内容 */}
                <div className={`p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-slate-100 text-slate-800 rounded-tr-none' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>

              </div>
            </div>
          ))}

          {/* Loading 状态 */}
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


        {/* 3. 底部：输入区 (Input Area) */}
        <div className="bg-white border-t border-slate-100 p-6">
          <div className="max-w-4xl mx-auto relative">
            {/* 输入框容器 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-inner focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all overflow-hidden">
              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="输入你想问的问题..."
                className="w-full bg-transparent p-4 min-h-[60px] max-h-[200px] outline-none resize-none text-slate-700 placeholder:text-slate-400"
                rows={2}
              />
              
              {/* 工具栏与发送按钮 */}
              <div className="flex justify-between items-center px-4 pb-3 pt-1">
                <div className="flex gap-2 text-slate-400">
                   <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors" title="上传文件"><Paperclip size={18} /></button>
                   <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors" title="语音输入"><Mic size={18} /></button>
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
              AI 可能会产生错误信息，请核对重要事实。
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AgentInterface;