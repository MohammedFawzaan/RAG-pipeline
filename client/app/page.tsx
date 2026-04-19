'use client';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import FileUploadComponent from '../components/file-upload';
import ChatComponent from '../components/chat';
import * as React from 'react';
import { Menu, X, FileText, Sparkles } from 'lucide-react';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <main className="h-screen bg-[#020203] text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-black/40 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight">DocMind</span>
        </div>
        <div className="flex items-center gap-3">
          <Show when="signed-in">
            <UserButton />
          </Show>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg bg-white/5 text-slate-400"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`
          fixed inset-0 z-40 lg:relative lg:inset-auto
          w-[300px] xl:w-[380px] h-full
          bg-[#050507] border-r border-white/5 
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col p-6 lg:p-8
        `}>
          <div className="hidden lg:flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                DocMind AI
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-0.5">
                Next-Gen RAG
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-8 custom-scrollbar overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 px-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>DATA INGESTION</span>
              </div>
              <FileUploadComponent />
            </div>

            <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">How to use</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Upload a document and start chatting. Our AI will analyze the content and provide precise answers directly from the source.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 mt-auto">
            <p className="text-[10px] text-slate-600 text-center font-medium">
              Powered by Google AI Studio
            </p>
          </div>
        </aside>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Section */}
        <section className="flex-1 flex flex-col bg-[radial-gradient(circle_at_50%_0%,_rgba(67,56,202,0.08)_0%,_transparent_60%)] relative overflow-hidden">
          {/* Header */}
          <header className="hidden lg:flex justify-end items-center px-8 gap-5 h-16 shrink-0 border-b border-white/5 bg-black/20 backdrop-blur-xl">
            <Show when="signed-out">
              <SignInButton>
                <button className="text-sm font-semibold text-slate-400 hover:text-white transition-all cursor-pointer">
                  Log in
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="bg-white text-black hover:bg-slate-200 rounded-lg font-bold text-xs h-9 px-5 transition-all shadow-lg active:scale-95 cursor-pointer">
                  Create Account
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton appearance={{ elements: { userButtonAvatarBox: 'w-9 h-9 border border-white/10' } }} />
            </Show>
          </header>

          <div className="flex-1 relative flex flex-col min-h-0">
            <ChatComponent />
          </div>
        </section>
      </div>
    </main>
  );
}