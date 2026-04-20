'use client';
import * as React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  const handleGoogleLogin = () => {
    setIsRedirecting(true);
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`;
  };

  return (
    <main className="h-screen bg-[#F5F6FA] text-gray-800 flex items-center justify-center font-sans overflow-hidden relative">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(99,102,241,0.08)_0%,_transparent_60%)]" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-md">

        {/* Logo */}
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center overflow-hidden drop-shadow-xl">
          <img src="/applogo.png" alt="RAGbot Logo" className="w-full h-full object-contain" />
        </div>

        <div className="space-y-3">
          <h1 className="w-full text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
            Retrieval-Augmented<br />Generation - AI Chatbot
          </h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
            Upload documents and chat with them using next-gen AI. Sign in to get started.
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isRedirecting}
          className="flex items-center gap-3 bg-white text-gray-800 hover:bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm h-12 px-8 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isRedirecting ? (
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          {isRedirecting ? 'Redirecting...' : 'Continue with Google'}
        </button>

        <p className="text-sm font-medium mt-2">
          Made with ❤️ by Mohammed Fawzaan.
        </p>
      </div>
    </main>
  );
}
