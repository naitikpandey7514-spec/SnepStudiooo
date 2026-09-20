import React, { useState } from 'react';
import { SNEPSTUDIO_FILES, CodeFile } from '../codeData';
import { FileCode, Download, Copy, Check, Folder, Terminal, Eye } from 'lucide-react';
import JSZip from 'jszip';

export const CodebaseExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(SNEPSTUDIO_FILES[2]); // default to database.py
  const [copied, setCopied] = useState(false);
  const [zipping, setZipping] = useState(false);

  const categories = Array.from(new Set(SNEPSTUDIO_FILES.map(f => f.category)));

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setZipping(true);
    try {
      const zip = new JSZip();
      const root = zip.folder("SnepStudio");

      // Add each file into the zip
      SNEPSTUDIO_FILES.forEach(file => {
        root?.file(file.path, file.content);
      });

      // Add upload folder structures with .gitkeep
      root?.file("uploads/photos/.gitkeep", "# Raw photos directory\n");
      root?.file("uploads/videos/.gitkeep", "# Raw videos directory\n");
      root?.file("uploads/completed/.gitkeep", "# Completed work directory\n");

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "SnepStudio_Flask_PostgreSQL_Project.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Zip generation error:", err);
    } finally {
      setZipping(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Actions */}
      <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm uppercase tracking-wider mb-1">
            <Terminal className="w-4 h-4" /> Production &amp; Evaluation Codebase
          </div>
          <h2 className="text-xl font-bold text-white">Full Python Flask &amp; PostgreSQL Source Code</h2>
          <p className="text-sm text-slate-400 mt-1">
            Browse all backend modules, Jinja2 templates, database schema scripts, and stylesheets. Download everything as a ready-to-run ZIP.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={zipping}
          className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-5 py-3 rounded-lg transition-all shadow-lg shadow-yellow-500/10 cursor-pointer disabled:opacity-60 whitespace-nowrap"
        >
          <Download className="w-5 h-5" />
          {zipping ? "Packaging ZIP..." : "Download SnepStudio.zip"}
        </button>
      </div>

      {/* Main Code Explorer Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar File Tree */}
        <div className="lg:col-span-4 bg-[#181b22] border border-[#2e3545] rounded-xl p-4 flex flex-col gap-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center justify-between">
            <span>Project Explorer</span>
            <span className="bg-[#242936] text-yellow-400 px-2 py-0.5 rounded text-[11px]">{SNEPSTUDIO_FILES.length} Files</span>
          </div>

          <div className="flex flex-col gap-4 max-h-[640px] overflow-y-auto pr-1">
            {categories.map(cat => (
              <div key={cat} className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 px-2 py-1 bg-[#13161c] rounded">
                  <Folder className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{cat}</span>
                </div>
                <div className="flex flex-col gap-1 pl-3 mt-1">
                  {SNEPSTUDIO_FILES.filter(f => f.category === cat).map(file => {
                    const isSelected = selectedFile.path === file.path;
                    return (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFile(file)}
                        className={`text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 font-semibold'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-yellow-400' : 'text-slate-400'}`} />
                          <span className="truncate">{file.path}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Content Viewer */}
        <div className="lg:col-span-8 bg-[#181b22] border border-[#2e3545] rounded-xl flex flex-col overflow-hidden">
          {/* Header Bar */}
          <div className="bg-[#12141a] border-b border-[#2e3545] px-5 py-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-mono text-sm text-slate-200">
              <FileCode className="w-4 h-4 text-yellow-400" />
              <span className="font-semibold text-white">SnepStudio/{selectedFile.path}</span>
              <span className="text-xs text-slate-400 font-sans ml-2 bg-[#222735] px-2 py-0.5 rounded">
                {selectedFile.content.split('\n').length} lines
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 bg-[#222735] hover:bg-[#2b3142] text-slate-200 text-xs font-semibold px-3 py-1.5 rounded transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer Body */}
          <div className="p-4 overflow-x-auto max-h-[640px] bg-[#0c0e12] text-xs font-mono leading-relaxed">
            <pre className="text-slate-300">
              <code>
                {selectedFile.content.split('\n').map((line, idx) => (
                  <div key={idx} className="flex hover:bg-white/5 py-0.5 px-2 rounded">
                    <span className="w-10 select-none text-slate-600 text-right pr-4 shrink-0 font-sans text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="whitespace-pre flex-1 text-slate-200">{line || ' '}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
