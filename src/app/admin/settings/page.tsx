import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  const settings = await getSettings();
  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">Pengaturan</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
