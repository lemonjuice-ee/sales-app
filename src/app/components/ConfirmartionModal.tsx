"use client";

import { useEffect, useState } from "react";

type ConfirmationModalProps = {
  message: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  confirmText?: string; // optional, defaults to "Confirm"
  type?: "default" | "delete"; // optional, defaults to "default"
};

export default function ConfirmationModal({
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  type = "default",
}: ConfirmationModalProps) {
  const [loading, setLoading] = useState(false);

  const confirmButtonClass =
    type === "delete"
      ? "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
      : "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2";

  // Handle Enter/Escape keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading) return; // disable shortcuts while loading
      if (e.key === "Enter") {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, loading]);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 transition-colors">
        {/* Message */}
        <p className="text-lg font-medium mb-4 text-black dark:text-white">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={confirmButtonClass}
          >
            {loading ? (
              <svg
                className="w-5 h-5 text-white animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
