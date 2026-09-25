"use client";
import { MessageCircle } from "lucide-react";
export function WhatsAppFloat({ phone }: { phone: string }) {
  const href = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent("Halo Admin, saya ingin bertanya tentang travel.")}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 active:scale-95 transition"
      aria-label="Chat WhatsApp">
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
