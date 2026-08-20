"use client";

import React, { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  isDanger = false,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="z-50 fixed inset-0 flex justify-center items-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in duration-200 fade-in"
    >
      <div className="relative space-y-4 bg-white dark:bg-surface-darkCard shadow-2xl p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-md">
        <button
          onClick={onClose}
          className="top-4 right-4 absolute hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Tutup dialog"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        <header className="flex items-start gap-3">
          {isDanger && (
            <div className="flex justify-center items-center bg-rose-100 dark:bg-rose-950/80 rounded-2xl w-10 h-10 text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
          )}
          <div>
            <h3
              id="modal-title"
              className="font-slab font-bold text-slate-900 dark:text-white text-base"
            >
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </header>

        {children && <div className="py-2 text-sm">{children}</div>}

        <footer className="flex justify-end items-center gap-2.5 pt-3 border-slate-100 dark:border-slate-800 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>
            {cancelText}
          </Button>
          {onConfirm && (
            <Button
              variant={isDanger ? "danger" : "primary"}
              size="sm"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}
