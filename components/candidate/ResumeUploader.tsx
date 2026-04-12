'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { extractTextFromPDF } from '@/lib/pdfExtractor';
import { GlowCard } from '@/components/ui/GlowCard';

interface ResumeUploaderProps {
  onExtracted: (text: string, fileName: string) => void;
}

export function ResumeUploader({ onExtracted }: ResumeUploaderProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );
  const [fileName, setFileName] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.pdf')) {
        setErrorMsg('Only PDF files are supported.');
        setState('error');
        return;
      }
      setState('loading');
      setFileName(file.name);
      try {
        const text = await extractTextFromPDF(file);
        if (!text || text.length < 50) {
          throw new Error(
            'Could not extract meaningful text. Ensure the PDF is not scanned/image-only.'
          );
        }
        const words = text.split(/\s+/).filter(Boolean).length;
        setWordCount(words);
        setState('success');
        onExtracted(text, file.name);
      } catch (err: unknown) {
        setErrorMsg(
          err instanceof Error ? err.message : 'Failed to extract text.'
        );
        setState('error');
      }
    },
    [onExtracted]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div className="space-y-4">
      <GlowCard
        glowColor="cyan"
        className={`transition-all duration-200 cursor-pointer ${isDragOver ? 'border-nt-cyan/60 shadow-glow-cyan scale-[1.01]' : ''}`}
        hover={state === 'idle'}
      >
        <div
          className="p-8 flex flex-col items-center gap-4 text-center"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => state === 'idle' && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && processFile(e.target.files[0])
            }
          />

          {state === 'idle' && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-nt-cyan/10 border border-nt-cyan/20 flex items-center justify-center">
                <Upload size={24} className="text-nt-cyan" />
              </div>
              <div>
                <p className="text-white font-medium">Drop your resume here</p>
                <p className="text-gray-500 text-sm mt-1">
                  or click to browse · PDF only
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="h-px w-8 bg-gray-800" />
                <span>
                  Extracted text stays local — never stored on servers
                </span>
                <div className="h-px w-8 bg-gray-800" />
              </div>
            </>
          )}

          {state === 'loading' && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-nt-purple/10 border border-nt-purple/20 flex items-center justify-center">
                <Loader2 size={24} className="text-nt-purple animate-spin" />
              </div>
              <div>
                <p className="text-white font-medium">
                  Extracting resume data…
                </p>
                <p className="text-gray-500 text-sm font-mono">{fileName}</p>
              </div>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-nt-cyan/10 border border-nt-cyan/30 flex items-center justify-center">
                <CheckCircle size={24} className="text-nt-cyan" />
              </div>
              <div>
                <p className="text-nt-cyan font-medium">
                  Resume extracted successfully
                </p>
                <div className="flex items-center justify-center gap-3 mt-2 text-sm">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <FileText size={13} />
                    {fileName}
                  </span>
                  <span className="text-nt-cyan/60 font-mono text-xs">
                    {wordCount.toLocaleString()} words
                  </span>
                </div>
              </div>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-red-900/20 border border-red-700/30 flex items-center justify-center">
                <AlertCircle size={24} className="text-red-400" />
              </div>
              <div>
                <p className="text-red-400 font-medium">Extraction failed</p>
                <p className="text-gray-500 text-sm mt-1 max-w-xs">
                  {errorMsg}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setState('idle');
                    setErrorMsg('');
                  }}
                  className="mt-3 text-xs text-nt-cyan hover:text-nt-cyan/80 underline"
                >
                  Try again
                </button>
              </div>
            </>
          )}
        </div>
      </GlowCard>
    </div>
  );
}
