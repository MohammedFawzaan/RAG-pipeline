'use client';
import * as React from 'react';
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import axios from 'axios';

const FileUploadComponent: React.FC = () => {
    const [status, setStatus] = React.useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [fileName, setFileName] = React.useState<string | null>(null);

    const handleFileUploadButtonClick = () => {
        const fileInput = document.createElement('input');
        fileInput.setAttribute('type', 'file');
        fileInput.setAttribute('accept', 'application/pdf');
        fileInput.addEventListener('change', async (ev) => {
            if (fileInput.files && fileInput.files.length > 0) {
                const file = fileInput.files.item(0);
                if (file) {
                    setFileName(file.name);
                    setStatus('uploading');
                    const formData = new FormData();
                    formData.append('pdf', file);

                    try {
                        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/pdf`, formData);

                        if (response.status === 200) {
                            setStatus('success');
                            setTimeout(() => {
                                setStatus('idle');
                                setFileName(null);
                            }, 3000);
                        } else {
                            setStatus('error');
                        }
                    } catch (error) {
                        console.error('Upload failed', error);
                        setStatus('error');
                    }
                }
            }
        });
        fileInput.click();
    };

    return (
        <div
            onClick={handleFileUploadButtonClick}
            className={`
                group relative cursor-pointer overflow-hidden
                rounded-3xl border-2 border-dashed transition-all duration-500
                p-10 flex flex-col items-center justify-center gap-6 text-center
                ${status === 'uploading' ? 'border-indigo-500 bg-indigo-500/10' :
                    status === 'success' ? 'border-emerald-500 bg-emerald-500/10' :
                        status === 'error' ? 'border-red-500 bg-red-500/10' :
                            'border-white/10 bg-white/[0.02] hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:scale-[1.02] active:scale-[0.98]'}
            `}
        >
            <div className={`
                w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500
                shadow-2xl
                ${status === 'uploading' ? 'bg-indigo-500 text-white animate-pulse' :
                    status === 'success' ? 'bg-emerald-500 text-white rotate-[360deg]' :
                        status === 'error' ? 'bg-red-500 text-white' :
                            'bg-white/5 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white'}
            `}>
                {status === 'uploading' ? <Loader2 className="w-10 h-10 animate-spin" /> :
                    status === 'success' ? <CheckCircle2 className="w-10 h-10" /> :
                        status === 'error' ? <Upload className="w-10 h-10" /> :
                            <FileText className="w-10 h-10" />}
            </div>

            <div className="space-y-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                    {status === 'uploading' ? 'Analyzing PDF...' :
                        status === 'success' ? 'Success!' :
                            status === 'error' ? 'Failed' :
                                'Drop your PDF here'}
                </h3>
                <p className="text-[13px] text-slate-500 font-semibold max-w-[200px] leading-tight mx-auto">
                    {fileName || 'Maximize your document insights with AI'}
                </p>
            </div>

            {/* Progress bar */}
            {status === 'uploading' && (
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/5">
                    <div className="h-full bg-indigo-500 animate-[shimmer_1.5s_infinite]" style={{ width: '100%', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
                </div>
            )}
        </div>
    );
};

export default FileUploadComponent;