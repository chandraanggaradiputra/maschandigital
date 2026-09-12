import { redirect } from "next/navigation";

/**
 * Halaman rute /dashboard/admin mengarahkan Super Admin
 * langsung ke Mobile Command Center dengan tab Broadcast Promo aktif.
 */
export default function DashboardAdminPage() {
  redirect("/admin/moderasi?tab=broadcast");
}
