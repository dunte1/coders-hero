import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bot, MessageSquare, Send, X } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { getSetting, type ChatMessage } from '@/types/website';
import { cn } from '@/lib/utils';

const suggestions = [
  'What programs do you offer?',
  'What age groups can join?',
  'How much do the programs cost?',
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({ queryKey: ['website', 'site'], queryFn: websiteApi.site.get });
  const settings = data?.settings;

  const enabled = getSetting(settings, 'chat.enabled', '1') !== '0';
  const widgetTitle = getSetting(settings, 'chat.widget_title', 'Hi there!');
  const widgetSubtitle = getSetting(settings, 'chat.widget_subtitle', 'Ask us anything');
  const welcomeMessage = getSetting(
    settings,
    'chat.welcome_message',
    "Hello! I'm the Coder's Hero assistant. Ask me about our programs, pricing or age groups!"
  );
  const primaryColor = getSetting(settings, 'chat.primary_color', '#00C8D7');

  const history = useRef<ChatMessage[]>([]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: welcomeMessage }]);
    }
  }, [open, messages.length, welcomeMessage]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  if (!enabled) return null;

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setTyping(true);

    try {
      const result = await websiteApi.chat.send(trimmed, history.current);
      history.current = [
        ...history.current.slice(-7),
        userMessage,
        { role: 'assistant', content: result.reply },
      ];
      setMessages([...nextMessages, { role: 'assistant', content: result.reply }]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: "Sorry, I couldn't respond right now. Please try again or use the contact form.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {open ? (
        <div className="mb-3 flex w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 text-white" style={{ backgroundColor: primaryColor }}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">{widgetTitle}</p>
                <p className="text-xs opacity-90">{widgetSubtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 hover:bg-white/20"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={bodyRef} className="flex max-h-80 flex-col gap-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  message.role === 'user'
                    ? 'self-end rounded-br-sm text-white'
                    : 'self-start rounded-bl-sm bg-white text-slate-800 shadow-sm'
                )}
                style={message.role === 'user' ? { backgroundColor: primaryColor } : undefined}
              >
                {message.content}
              </div>
            ))}
            {typing ? (
              <div className="flex items-center gap-1 self-start rounded-2xl rounded-bl-sm bg-white px-3.5 py-3 shadow-sm">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400"
                    style={{ animationDelay: `${dot * 150}ms` }}
                  />
                ))}
              </div>
            ) : null}
          </div>

          {messages.length <= 1 ? (
            <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-white p-3">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex items-center gap-2 border-t border-slate-100 bg-white p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send(input);
              }}
              placeholder="Type your question..."
              className="h-10 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
            <button
              type="button"
              onClick={() => send(input)}
              disabled={!input.trim() || typing}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-opacity disabled:opacity-40"
              style={{ backgroundColor: primaryColor }}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105"
        style={{ backgroundColor: primaryColor }}
        aria-label="Open chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </div>
  );
}
