import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { requireRole } from "@/lib/auth/users";
import {
  adminEnums,
  getAdminDashboard,
  listAdminCities,
  listAdminRestaurants,
  listAdminReviews,
  listAdminUsers
} from "@/services/admin/admin-service";

export default async function AdminPage() {
  const user = await requireRole(["ADMIN"]);
  const [dashboard, restaurants, users, reviews, cities] = await Promise.all([
    getAdminDashboard(),
    listAdminRestaurants({ q: "", page: 1, limit: 12 }),
    listAdminUsers({ q: "", page: 1, limit: 12 }),
    listAdminReviews({ q: "", page: 1, limit: 12 }),
    listAdminCities()
  ]);

  const initialData = JSON.parse(
    JSON.stringify({
      user,
      dashboard,
      restaurants,
      users,
      reviews,
      cities,
      enums: adminEnums
    })
  );

  return <AdminDashboard initialData={initialData} />;
}
