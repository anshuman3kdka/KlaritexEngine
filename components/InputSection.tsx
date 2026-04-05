import React, { useState, useRef } from 'react';

interface InputSectionProps {
  onAnalyze: (text: string, fileData?: { mimeType: string, data: string }, url?: string) => void;
  isLoading: boolean;
}

type InputMode = 'direct' | 'url';

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isLoading }) => {
  const [mode, setMode] = useState<InputMode>('direct');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<{ name: string; mimeType: string; data: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'direct') {
      if (text.trim() || file) {
        onAnalyze(text, file ? { mimeType: file.mimeType, data: file.data } : undefined);
      }
    } else {
      if (url.trim()) {
        onAnalyze('', undefined, url);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check strict PDF type
    if (selectedFile.type !== 'application/pdf') {
      alert("Please upload a PDF document.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      // Extract base64 part (remove data:application/pdf;base64, prefix)
      const base64Data = result.split(',')[1];
      setFile({
        name: selectedFile.name,
        mimeType: selectedFile.type,
        data: base64Data
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none p-6 md:p-8 mb-8 transition-colors duration-300">
      
      {/* Mode Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6">
        <button
          type="button"
          onClick={() => setMode('direct')}
          className={`pb-3 px-4 text-xs font-bold font-mono uppercase tracking-widest transition-colors relative
            ${mode === 'direct' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}
        >
          Paste / Upload
          {mode === 'direct' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 dark:bg-white"></span>}
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`pb-3 px-4 text-xs font-bold font-mono uppercase tracking-widest transition-colors relative
            ${mode === 'url' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}
        >
          Use a Link
          {mode === 'url' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400"></span>}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        
        {mode === 'direct' ? (
          <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-3">
              <label htmlFor="statement" className="block text-xs font-bold font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Paste text or attach PDF
              </label>
              {file && (
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-mono animate-fade-in-up">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="truncate max-w-[150px] md:max-w-[300px]">{file.name}</span>
                  <button 
                    type="button" 
                    onClick={handleRemoveFile} 
                    className="hover:text-rose-500 transition-colors ml-1"
                    aria-label="Remove file"
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
            
            <textarea
              id="statement"
              className="w-full h-40 p-4 font-mono text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-slate-900 dark:focus:border-slate-500 focus:ring-0 transition-colors resize-none rounded-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Paste text here..."
              maxLength={10000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            />

            <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                  {text.length}/10000 Chars
                </span>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="application/pdf" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || !!file}
                  className={`flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wide px-3 py-1.5 rounded-sm border transition-all
                    ${file ? 'text-slate-300 border-slate-200 dark:border-slate-800 cursor-not-allowed' : 'text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Attach PDF
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
             <label htmlFor="url-input" className="block text-xs font-bold font-mono text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-3">
                Paste Link
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <input
                  id="url-input"
                  type="url"
                  className="w-full pl-12 pr-4 py-4 font-mono text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-0 transition-colors rounded-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-mono">
                We'll grab the text and check it.
              </p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
           <button
            type="submit"
            disabled={isLoading || (mode === 'direct' ? (!text.trim() && !file) : !url.trim())}
            className={`w-full md:w-auto px-8 py-3 font-mono text-sm font-bold uppercase tracking-wide text-white transition-all 
              ${isLoading || (mode === 'direct' ? (!text.trim() && !file) : !url.trim()) 
                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' 
                : mode === 'url' ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500' 
                : 'bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600'}`}
          >
            {isLoading ? 'Checking...' : 'Klaritex This'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default InputSection;