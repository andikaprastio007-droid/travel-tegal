import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, Calendar, Map, Settings, LogOut, CreditCard } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  // Biarkan /admin/login lewat tanpa auth
  // Deteksi sederhana: layout ini akan tetap render; login page tidak butuh admin
  // Jadi kita cek di page/page yg memerlukan.
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {admin && (
        <aside className="md:w-60 md:min-h-screen bg-white border-b md:border-b-0 md:border-r border-gray-200">
          <div className="p-4 border-b">
            <div className="font-bold text-brand-700">Admin Panel</div>
            <div className="text-xs text-gray-500 mt-1">{admin.name}</div>
          </div>
          <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-2 gap-1">
            {[
              { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
              { href: "/admin/bookings", label: "Booking", icon: Calendar },
              { href: "/admin/payments", label: "Pembayaran", icon: CreditCard },
              { href: "/admin/settings", label: "Pengaturan", icon: Settings },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap">
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            ))}
            <form action="/api/auth/logout" method="post" className="md:mt-auto">
              <button type="submit" className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </form>
          </nav>
        </aside>
      )}
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
