"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Bus } from "lucide-react";

export function Navbar({ travelName }: { travelName: string }) {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: "Beranda" },
    { href: "/search", label: "Pesan Tiket" },
    { href: "/carter", label: "Carter" },
    { href: "/cek-booking", label: "Cek Booking" },
    { href: "/#kontak", label: "Kontak" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-700">
          <Bus className="h-5 w-5" />
          <span className="text-base sm:text-lg">{travelName}</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => <Link key={l.href} href={l.href} className="text-sm font-medium text-gray-700 hover:text-brand-600">{l.label}</Link>)}
          <Link href="/admin/login" className="text-xs text-gray-400 hover:text-gray-600">Admin</Link>
        </div>
        <button className="md:hidden rounded-lg p-2 hover:bg-gray-100" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open && (
        <div className="border-t border-gray-200 md:hidden">
          <div className="flex flex-col px-4 py-2">
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">{l.label}</Link>
            ))}
            <Link href="/admin/login" onClick={() => setOpen(false)} className="rounded-lg py-2.5 text-sm text-gray-400">Login Admin</Link>
          </div>
        </div>
      )}
    </header>
  );
}
