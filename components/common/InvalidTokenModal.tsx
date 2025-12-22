"use client";

import { useRouter } from "next/navigation";

interface InvalidTokenModalProps {
  isOpen: boolean;
  message?: string;
}

export default function InvalidTokenModal({
  isOpen,
  message = "Invalid or expired token. Please request a new link.",
}: InvalidTokenModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleOk = () => {
    router.push("/");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg border border-slate-200 dark:border-[#324d67] p-6 max-w-md w-full">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 text-red-500">
            <span className="material-symbols-outlined text-4xl">error</span>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Invalid Token
            </h2>
            <p className="text-sm text-slate-500 dark:text-[#92adc9]">
              {message}
            </p>
          </div>
          <button
            onClick={handleOk}
            className="flex w-full cursor-pointer items-center justify-center rounded-lg h-12 px-5 bg-primary hover:bg-blue-600 text-white text-base font-bold leading-normal tracking-wide transition-all shadow-md shadow-primary/20"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}





