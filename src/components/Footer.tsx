import Link from "next/link";
export function Footer({ travelName, address, email, footerText }: {
  travelName: string; address: string; email: string; footerText: string;
}) {
  return (
    <footer id="kontak" className="mt-16 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-bold text-brand-700 mb-2">{travelName}</h3>
          <p className="text-sm text-gray-600">Travel Tegal ↔ Jabodetabek. Perjalanan nyaman, aman, dan mudah dipesan.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-sm">Kontak</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>📍 {address}</li>
            <li>✉️ {email}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-sm">Menu</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li><Link href="/search" className="hover:text-brand-600">Pesan Tiket</Link></li>
            <li><Link href="/carter" className="hover:text-brand-600">Carter Mobil</Link></li>
            <li><Link href="/cek-booking" className="hover:text-brand-600">Cek Booking</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-500">{footerText}</div>
    </footer>
  );
}
