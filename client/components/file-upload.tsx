'use client';
import * as React from 'react';
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { uploadPdf } from '@/api/api';

interface FileUploadProps {
    onSuccess?: (documentId: string, fileName: string) => void;
}

const FileUploadComponent: React.FC<FileUploadProps> = ({ onSuccess }) => {
    const [status, setStatus] = React.useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [fileName, setFileName] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setStatus('uploading');
        const formData = new FormData();
        formData.append('pdf', file);

        if (inputRef.current) inputRef.current.value = '';

        try {
            const data = await uploadPdf(formData);
            setStatus('success');
            // Notify parent with documentId + fileName for instant list update
            if (data.documentId && onSuccess) {
                onSuccess(data.documentId, data.fileName ?? file.name);
            }
            setTimeout(() => {
                setStatus('idle');
                setFileName(null);
            }, 3000);
        } catch (error) {
            console.error('Upload failed', error);
            setStatus('error');
        }
    };

    return (
        <div
            onClick={() => inputRef.current?.click()}
            className={`
                group relative cursor-pointer overflow-hidden
                rounded-2xl border-2 border-dashed transition-all duration-500
                p-8 flex flex-col items-center justify-center gap-5 text-center
                ${status === 'uploading' ? 'border-indigo-400 bg-indigo-50' :
                    status === 'success' ? 'border-emerald-400 bg-emerald-50' :
                        status === 'error' ? 'border-red-400 bg-red-50' :
                            'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/50 active:scale-[0.98]'}
            `}
        >
            <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleChange}
            />

            <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm
                ${status === 'uploading' ? 'bg-indigo-500 text-white animate-pulse' :
                    status === 'success' ? 'bg-emerald-500 text-white' :
                        status === 'error' ? 'bg-red-500 text-white' :
                            'bg-white text-gray-400 border border-gray-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600'}
            `}>
                {status === 'uploading' ? <Loader2 className="w-8 h-8 animate-spin" /> :
                    status === 'success' ? <CheckCircle2 className="w-8 h-8" /> :
                        status === 'error' ? <Upload className="w-8 h-8" /> :
                            <FileText className="w-8 h-8" />}
            </div>

            <div className="space-y-1">
                <h3 className={`text-sm font-bold tracking-tight
                    ${status === 'uploading' ? 'text-indigo-700' :
                        status === 'success' ? 'text-emerald-700' :
                            status === 'error' ? 'text-red-700' : 'text-gray-700'}
                `}>
                    {status === 'uploading' ? 'Uploading...' :
                        status === 'success' ? 'Upload Successful!' :
                            status === 'error' ? 'Upload Failed' : 'Drop your PDF here'}
                </h3>
                <p className="text-[12px] text-gray-400 font-medium max-w-[180px] leading-tight mx-auto">
                    {fileName || 'Click to browse and select a PDF file'}
                </p>
            </div>

            {status === 'uploading' && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-100">
                    <div className="h-full bg-indigo-500" style={{ width: '100%', backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                </div>
            )}
        </div>
    );
};

export default FileUploadComponent;