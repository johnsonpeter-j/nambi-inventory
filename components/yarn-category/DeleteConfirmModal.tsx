"use client";

interface DeleteConfirmModalProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export default function DeleteConfirmModal({
  show,
  onConfirm,
  onCancel,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
}: DeleteConfirmModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-xl border border-slate-200 dark:border-[#324d67] w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-[#92adc9] mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-[#324d67] bg-slate-50 dark:bg-[#101922] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#0f172a] transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

