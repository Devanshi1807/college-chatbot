import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { formatMessage } from '../utils';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Hello! 👋 I am the **BIET Fresher Assistant**. Ask me about admission, documents, fees, hostel, or campus info.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [quickReplies, setQuickReplies] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.getQuickReplies().then(setQuickReplies).catch(console.error);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = text.trim();
    if (!msg || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      const data = await api.chat(msg, sessionId);
      if (!sessionId) setSessionId(data.sessionId);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: data.response,
          category: data.category,
          source: data.source,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Sorry, something went wrong. Please try again or contact the admission office.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              BIET
            </div>
            <div>
              <h1 className="font-semibold text-slate-800">BIET Fresher Assistant</h1>
              <p className="text-xs text-slate-500">Admission & Campus Help</p>
            </div>
          </div>
          <Link
            to="/admin"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[50vh]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md shadow-sm'
                }`}
              >
                <div
                  className="markdown-body"
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                />
                {msg.category && (
                  <span className="inline-block mt-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    {msg.category}
                  </span>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {quickReplies.map((qr) => (
              <button
                key={qr.id}
                onClick={() => sendMessage(qr.message)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 transition disabled:opacity-50"
              >
                {qr.label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 pb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about admission, fees, documents..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
