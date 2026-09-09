"use client";

import React, { useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WysiwygEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function WysiwygEditor({
  value,
  onChange,
  placeholder = "Tuliskan rincian deskripsi lengkap produk Anda di sini...",
  className,
}: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Inisialisasi konten awal
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const executeCommand = (command: string, valueArgument: string = "") => {
    document.execCommand(command, false, valueArgument);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 overflow-hidden shadow-2xs focus-within:ring-2 focus-within:ring-[#093c96] focus-within:border-transparent transition-all",
        className
      )}
    >
      {/* Toolbar WYSIWYG */}
      <div className={cn('flex', 'flex-wrap', 'items-center', 'gap-1', 'p-2', 'bg-slate-50', 'dark:bg-slate-900/60', 'border-b', 'border-slate-200', 'dark:border-slate-700/80')}>
        <button
          type="button"
          onClick={() => executeCommand("bold")}
          title="Tebal (Ctrl+B)"
          className={cn('p-1.5', 'rounded-lg', 'text-slate-700', 'dark:text-slate-300', 'hover:bg-slate-200', 'dark:hover:bg-slate-700', 'transition-colors')}
        >
          <Bold className={cn('w-4', 'h-4')} />
        </button>

        <button
          type="button"
          onClick={() => executeCommand("italic")}
          title="Miring (Ctrl+I)"
          className={cn('p-1.5', 'rounded-lg', 'text-slate-700', 'dark:text-slate-300', 'hover:bg-slate-200', 'dark:hover:bg-slate-700', 'transition-colors')}
        >
          <Italic className={cn('w-4', 'h-4')} />
        </button>

        <div className={cn('h-4', 'w-px', 'bg-slate-300', 'dark:bg-slate-700', 'mx-1')} />

        <button
          type="button"
          onClick={() => executeCommand("formatBlock", "<h2>")}
          title="Judul Bagian (H2)"
          className={cn('px-2', 'py-1', 'rounded-lg', 'text-xs', 'font-bold', 'text-slate-700', 'dark:text-slate-300', 'hover:bg-slate-200', 'dark:hover:bg-slate-700', 'transition-colors', 'flex', 'items-center', 'gap-0.5')}
        >
          <Heading2 className={cn('w-4', 'h-4')} />
        </button>

        <button
          type="button"
          onClick={() => executeCommand("formatBlock", "<h3>")}
          title="Sub-judul (H3)"
          className={cn('px-2', 'py-1', 'rounded-lg', 'text-xs', 'font-bold', 'text-slate-700', 'dark:text-slate-300', 'hover:bg-slate-200', 'dark:hover:bg-slate-700', 'transition-colors', 'flex', 'items-center', 'gap-0.5')}
        >
          <Heading3 className={cn('w-4', 'h-4')} />
        </button>

        <div className={cn('h-4', 'w-px', 'bg-slate-300', 'dark:bg-slate-700', 'mx-1')} />

        <button
          type="button"
          onClick={() => executeCommand("insertUnorderedList")}
          title="Daftar Poin (Bullets)"
          className={cn('p-1.5', 'rounded-lg', 'text-slate-700', 'dark:text-slate-300', 'hover:bg-slate-200', 'dark:hover:bg-slate-700', 'transition-colors')}
        >
          <List className={cn('w-4', 'h-4')} />
        </button>

        <button
          type="button"
          onClick={() => executeCommand("insertOrderedList")}
          title="Daftar Nomor"
          className={cn('p-1.5', 'rounded-lg', 'text-slate-700', 'dark:text-slate-300', 'hover:bg-slate-200', 'dark:hover:bg-slate-700', 'transition-colors')}
        >
          <ListOrdered className={cn('w-4', 'h-4')} />
        </button>

        <button
          type="button"
          onClick={() => executeCommand("formatBlock", "<blockquote>")}
          title="Kutipan (Quote)"
          className={cn('p-1.5', 'rounded-lg', 'text-slate-700', 'dark:text-slate-300', 'hover:bg-slate-200', 'dark:hover:bg-slate-700', 'transition-colors')}
        >
          <Quote className={cn('w-4', 'h-4')} />
        </button>

        <div className={cn('h-4', 'w-px', 'bg-slate-300', 'dark:bg-slate-700', 'mx-1')} />

        <button
          type="button"
          onClick={() => executeCommand("undo")}
          title="Urungkan (Ctrl+Z)"
          className={cn('p-1.5', 'rounded-lg', 'text-slate-700', 'dark:text-slate-300', 'hover:bg-slate-200', 'dark:hover:bg-slate-700', 'transition-colors')}
        >
          <Undo className={cn('w-3.5', 'h-3.5')} />
        </button>

        <button
          type="button"
          onClick={() => executeCommand("redo")}
          title="Ulangi (Ctrl+Y)"
          className={cn('p-1.5', 'rounded-lg', 'text-slate-700', 'dark:text-slate-300', 'hover:bg-slate-200', 'dark:hover:bg-slate-700', 'transition-colors')}
        >
          <Redo className={cn('w-3.5', 'h-3.5')} />
        </button>
      </div>

      {/* Area Edit ContentEditable */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        className={cn('p-4', 'min-h-[180px]', 'max-h-[400px]', 'overflow-y-auto', 'focus:outline-none', 'text-xs', 'sm:text-sm', 'text-slate-900', 'dark:text-white', 'leading-relaxed', '[&_p]:mb-3', '[&_p]:leading-relaxed', '[&_ul]:list-disc', '[&_ul]:pl-5', '[&_ul]:mb-3', '[&_ul]:space-y-1', '[&_ol]:list-decimal', '[&_ol]:pl-5', '[&_ol]:mb-3', '[&_ol]:space-y-1', '[&_h2]:text-base', '[&_h2]:font-bold', '[&_h2]:mb-2', '[&_h2]:text-slate-900', 'dark:[&_h2]:text-white', '[&_h3]:text-sm', '[&_h3]:font-bold', '[&_h3]:mb-1.5', '[&_h3]:text-slate-800', 'dark:[&_h3]:text-slate-200', '[&_blockquote]:border-l-4', '[&_blockquote]:border-[#093c96]', '[&_blockquote]:pl-3', '[&_blockquote]:italic', '[&_blockquote]:my-2', 'empty:before:content-[attr(data-placeholder)]', 'empty:before:text-slate-400', 'empty:before:pointer-events-none')}
      />
    </div>
  );
}
