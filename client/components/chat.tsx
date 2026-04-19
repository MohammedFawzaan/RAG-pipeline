'use client';

import { Input } from '@/components/ui/input';
import * as React from 'react';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import axios from 'axios';

interface Doc {
    pageContent?: string;
    metadata?: {
        loc?: {
            pageNumber?: number;
        };
        source?: string;
    };
}

interface IMessage {
    role: 'assistant' | 'user';
    content?: string;
    documents?: Doc[];
}

const ChatComponent: React.FC = () => {
    const [message, setMessage] = React.useState<string>('');
    const [messages, setMessages] = React.useState<IMessage[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendChatMessage = async () => {
        if (!message.trim()) return;

        const userMessage = message;
        setMessage('');
        setIsLoading(true);
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`, { message: userMessage });
            const { data: responseData } = res;
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: responseData?.message,
                    documents: responseData?.docs,
                },
            ]);
        } catch (error) {
            console.error('Chat failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide"
            >
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center">
                            <Bot className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold">Ready to help</p>
                            <p className="text-xs max-w-[200px]">Upload a document and ask me anything about its content.</p>
                        </div>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                                <Bot className="w-4 h-4" />
                            </div>
                        )}

                        <div className={`
                            max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 text-base sm:text-[17px] leading-relaxed shadow-sm
                            ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-white/5 border border-white/10 rounded-tl-none font-medium'}
                        `}>
                            {msg.content}

                            {msg.documents && msg.documents.length > 0 && (
                                <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Related Sources</p>
                                    <div className="flex flex-wrap gap-2">
                                        {msg.documents.map((doc, i) => (
                                            <span key={i} className="text-[11px] bg-white/10 px-3 py-1.5 rounded-full border border-white/10 text-slate-300 font-bold">
                                                Page {doc.metadata?.loc?.pageNumber || 'N/A'}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 shrink-0">
                                <User className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-4 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-white/5 shrink-0" />
                        <div className="h-10 w-32 bg-white/5 rounded-2xl rounded-tl-none" />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[linear-gradient(to_top,_rgba(10,10,12,1)_60%,_transparent)]">
                <div className="max-w-3xl mx-auto relative group">
                    <Input
                        value={message}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ask a question about your document..."
                        className="h-14 pl-6 pr-16 rounded-2xl bg-white/[0.03] border-white/10 focus-within:bg-white/[0.05] focus-within:border-indigo-500/50 transition-all"
                    />
                    <button
                        onClick={handleSendChatMessage}
                        disabled={!message.trim() || isLoading}
                        className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 flex items-center justify-center transition-colors"
                    >
                        <Send className="w-4 h-4 text-white" />
                    </button>
                </div>
                <p className="text-[10px] text-center mt-3 text-slate-600">
                    DocMind AI can make mistakes. Verify important information.
                </p>
            </div>
        </div>
    );
};
export default ChatComponent;