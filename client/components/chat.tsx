'use client';

import { Input } from '@/components/ui/input';
import * as React from 'react';
import { Send, User, Bot, Plus, FileText } from 'lucide-react';
import { sendChatMessage } from '@/api/api';

interface Doc {
    pageContent?: string;
    metadata?: {
        loc?: { pageNumber?: number };
        source?: string;
        fileName?: string;
    };
}

interface IMessage {
    role: 'assistant' | 'user';
    content?: string;
    documents?: Doc[];
}

interface ChatProps {
    onUploadClick?: () => void;
    activeDocumentId?: string | null;
    activeDocumentName?: string | null;
}

const ChatComponent: React.FC<ChatProps> = ({ onUploadClick, activeDocumentId, activeDocumentName }) => {
    const [message, setMessage] = React.useState<string>('');
    const [messages, setMessages] = React.useState<IMessage[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Reset chat when document changes
    React.useEffect(() => {
        setMessages([]);
    }, [activeDocumentId]);

    const handleSendChatMessage = async () => {
        if (!message.trim() || !activeDocumentId) return;
        const userMessage = message;
        setMessage('');
        setIsLoading(true);
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

        try {
            const responseData = await sendChatMessage(userMessage, activeDocumentId);
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

            {/* Active document banner */}
            {activeDocumentName && (
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border-b border-indigo-100">
                    <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <p className="text-xs font-semibold text-indigo-700 truncate">
                        Chatting with: <span className="font-bold">{activeDocumentName}</span>
                    </p>
                </div>
            )}

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-hide">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                            <Bot className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-gray-700">
                                {activeDocumentId ? 'Ready to help' : 'No document selected'}
                            </p>
                            <p className="text-xs text-gray-400 max-w-[220px]">
                                {activeDocumentId
                                    ? `Ask anything about "${activeDocumentName}"`
                                    : 'Upload a PDF and select it from the sidebar to start chatting.'}
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 shrink-0 mt-1">
                                <Bot className="w-4 h-4" />
                            </div>
                        )}

                        <div className={`
                            max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm
                            ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none font-medium'}
                        `}>
                            {msg.content}

                            {msg.documents && msg.documents.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Related Sources</p>
                                    <div className="flex flex-wrap gap-2">
                                        {msg.documents.map((doc, i) => (
                                            <span key={i} className="text-[11px] bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full border border-indigo-100 font-bold flex items-center gap-1.5">
                                                <FileText className="w-3 h-3 shrink-0" />
                                                {doc.metadata?.fileName && (
                                                    <span className="max-w-[120px] truncate">{doc.metadata.fileName}</span>
                                                )}
                                                <span className="text-indigo-400">·</span>
                                                p.{doc.metadata?.loc?.pageNumber || '?'}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-1">
                                <User className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 shrink-0" />
                        <div className="h-10 w-36 bg-gray-200 rounded-2xl rounded-tl-none" />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="max-w-3xl mx-auto flex items-center gap-2">
                    {onUploadClick && (
                        <button
                            onClick={onUploadClick}
                            className="lg:hidden flex-shrink-0 w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 flex items-center justify-center text-indigo-500 transition-all"
                            title="Upload PDF"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    )}
                    <div className="relative flex-1">
                        <Input
                            value={message}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={activeDocumentId ? "Ask a question about your document..." : "Select a document first..."}
                            disabled={!activeDocumentId}
                            className="h-12 pl-5 pr-14 rounded-xl bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus-within:border-indigo-400 focus-within:bg-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={handleSendChatMessage}
                            disabled={!message.trim() || isLoading || !activeDocumentId}
                            className="absolute right-2 top-1.5 h-9 w-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 flex items-center justify-center transition-colors shadow-sm"
                        >
                            <Send className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>
                <p className="text-xs text-center text-gray-400 mt-3">
                    Made with ❤️ by Mohammed Fawzaan.
                </p>
            </div>
        </div>
    );
};

export default ChatComponent;