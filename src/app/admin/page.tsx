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
  const user = await requireRole(["ADMIN", "MODERATOR"]);

  if (user.role === "MODERATOR") {
    const reviews = await listAdminReviews({ q: "", page: 1, limit: 12 });
    const initialData = JSON.parse(
      JSON.stringify({
        user,
        dashboard: {
          stats: {
            users: 0,
            lockedUsers: 0,
            restaurants: 0,
            inactiveRestaurants: 0,
            reviews: reviews.pagination.total,
            hiddenReviews: reviews.items.filter((review) => review.status === "HIDDEN").length,
            flaggedReviews: reviews.items.filter((review) => review.status === "FLAGGED").length,
            tours: 0
          },
          recentReviews: [],
          recentTours: []
        },
        restaurants: { items: [], pagination: { total: 0 } },
        users: { items: [], pagination: { total: 0 } },
        reviews,
        cities: [],
        enums: adminEnums
      })
    );

    return <AdminDashboard initialData={initialData} />;
  }

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
