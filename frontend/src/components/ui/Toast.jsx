"use client";

import { useToast } from "@/components/context/ToastContext";

export default function Toast() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-0 right-0 p-4 space-y-2 z-50 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg text-white pointer-events-auto animate-slide-in ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
