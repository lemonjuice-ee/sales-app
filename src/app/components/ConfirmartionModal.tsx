"use client";

import { useEffect } from "react";

type ConfirmationModalProps = {
  message: string;
  onConfirm: () => void;
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
  const confirmButtonClass =
    type === "delete"
      ? "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      : "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700";

  // Handle Enter/Escape keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onConfirm, onCancel]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
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
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button onClick={onConfirm} className={confirmButtonClass}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
