'use client';
import FileUploadComponent from '../../components/file-upload';
import ChatComponent from '../../components/chat';
import { useAuth } from '@/context/AuthContext';
import * as React from 'react';
import { FileText, LogOut, X, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { getFiles } from '@/api/api';

interface DocFile {
    documentId: string;
    fileName: string;
    uploadedAt: string;
}

export default function ChatPage() {
    const [isUploadOpen, setIsUploadOpen] = React.useState(false);
    const [files, setFiles] = React.useState<DocFile[]>([]);
    const [activeDocumentId, setActiveDocumentId] = React.useState<string | null>(null);
    const [activeDocumentName, setActiveDocumentName] = React.useState<string | null>(null);
    const { user, logout, isLoading } = useAuth();
    const router = React.useMemo(() => typeof window !== 'undefined' ? window : null, []);

    // Protection logic: if not loading and no user, kick back to landing
    React.useEffect(() => {
        if (!isLoading && !user) {
            window.location.href = '/';
        }
    }, [user, isLoading]);

    // Load user's file list on mount
    React.useEffect(() => {
        if (!user) return; // Wait for user to be available
        getFiles()
            .then(data => {
                if (data.success && data.files.length > 0) {
                    setFiles(data.files);
                    setActiveDocumentId(data.files[0].documentId);
                    setActiveDocumentName(data.files[0].fileName);
                }
            })
            .catch(() => { });
    }, []);

    // Called by FileUploadComponent after a successful upload
    const handleUploadSuccess = (documentId: string, fileName: string) => {
        const newFile: DocFile = { documentId, fileName, uploadedAt: new Date().toISOString() };
        setFiles(prev => [newFile, ...prev]);
        setActiveDocumentId(documentId);
        setActiveDocumentName(fileName);
        setIsUploadOpen(false); // close mobile overlay after upload
    };

    const selectDocument = (file: DocFile) => {
        setActiveDocumentId(file.documentId);
        setActiveDocumentName(file.fileName);
    };

    const FileList = () => (
        <div className="space-y-2">
            {files.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No documents yet. Upload a PDF to get started.</p>
            ) : (
                files.map(file => (
                    <button
                        key={file.documentId}
                        onClick={() => selectDocument(file)}
                        className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer
                            ${activeDocumentId === file.documentId
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                : 'bg-white border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/40 text-gray-700'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                            ${activeDocumentId === file.documentId ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                            {activeDocumentId === file.documentId
                                ? <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                                : <FileText className="w-4 h-4 text-gray-400" />
                            }
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold truncate">{file.fileName}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <Clock className="w-2.5 h-2.5 text-gray-400" />
                                <p className="text-[10px] text-gray-400">
                                    {new Date(file.uploadedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </button>
                ))
            )}
        </div>
    );

    if (isLoading) return <div className="h-screen bg-[#F5F6FA] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm font-semibold animate-pulse tracking-wide">SECURELY LOADING YOUR CHATS...</p>
        </div>
    </div>;

    return (
        <main className="h-screen bg-[#F5F6FA] text-gray-800 flex flex-col font-sans overflow-hidden">

            {/* Unified Navbar */}
            <header className="flex items-center justify-between px-5 h-16 border-b border-gray-200 bg-white shadow-sm shrink-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden">
                        <img src="/applogo.png" alt="RAGbot" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <span className="font-black text-gray-900 tracking-tight">RAGbot - AI</span>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">Next-Gen RAG</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {user?.avatar && (
                        <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" />
                    )}
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-bold text-gray-800 leading-tight truncate max-w-[140px]">{user?.name}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{user?.email}</p>
                    </div>
                    <button onClick={logout} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer" title="Logout">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">

                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-[300px] xl:w-[340px] h-full bg-white border-r border-gray-200 flex-col p-6 shrink-0 shadow-sm">
                    <div className="flex-1 flex flex-col gap-6 overflow-y-auto min-h-0">

                        {/* Upload Section */}
                        <div className="space-y-3 shrink-0">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                <span>UPLOAD DOCUMENT</span>
                            </div>
                            <FileUploadComponent onSuccess={handleUploadSuccess} />
                        </div>

                        {/* Document List */}
                        <div className="space-y-3 flex-1 min-h-0 flex flex-col">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                <span>YOUR DOCUMENTS</span>
                                {files.length > 0 && (
                                    <span className="ml-auto bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {files.length}
                                    </span>
                                )}
                            </div>
                            <div className="overflow-y-auto flex-1">
                                <FileList />
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Mobile Upload Overlay */}
                {isUploadOpen && (
                    <div className="lg:hidden fixed inset-0 z-[100] bg-[#F5F6FA] flex flex-col p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-500" />
                                <span className="font-bold text-gray-800 uppercase tracking-wider text-xs">Upload Document</span>
                            </div>
                            <button onClick={() => setIsUploadOpen(false)} className="p-2 rounded-full bg-gray-100 text-gray-500">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <FileUploadComponent onSuccess={handleUploadSuccess} />

                        {files.length > 0 && (
                            <div className="mt-6 space-y-3">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Documents</p>
                                <FileList />
                            </div>
                        )}
                    </div>
                )}

                {/* Chat Section */}
                <section className="flex-1 flex flex-col bg-[#F5F6FA] overflow-hidden">
                    <ChatComponent
                        onUploadClick={() => setIsUploadOpen(true)}
                        activeDocumentId={activeDocumentId}
                        activeDocumentName={activeDocumentName}
                    />
                </section>
            </div>
        </main>
    );
}