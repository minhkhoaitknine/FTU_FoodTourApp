import {
  CalendarDays,
  Heart,
  History,
  Home,
  MapPinned,
  Settings,
  Sparkles,
  Star,
  Utensils
} from "lucide-react";
import Link from "next/link";

const navItems = [
  { label: "Home", icon: Home, active: true, href: "/" },
  { label: "Plan tour", icon: CalendarDays, href: "/tour-generator" },
  { label: "Food map", icon: MapPinned, href: "/map" },
  { label: "Favorites", icon: Heart, href: "/favorites" },
  { label: "History", icon: History, href: "/tours" },
  { label: "Settings", icon: Settings, href: "#" }
];

const stops = [
  {
    time: "07:30",
    meal: "Breakfast",
    name: "Pho Old Quarter",
    description: "Warm beef broth, herbs and rice noodles for a light start.",
    price: "45k/person",
    rating: "4.7"
  },
  {
    time: "11:45",
    meal: "Lunch",
    name: "Bun Cha Riverside",
    description: "Grilled pork, fresh herbs and balanced fish sauce.",
    price: "55k/person",
    rating: "4.8"
  },
  {
    time: "15:30",
    meal: "Snack",
    name: "Banh Mi Lantern",
    description: "Crispy bread, pate, pickles and local herbs.",
    price: "35k/person",
    rating: "4.6"
  },
  {
    time: "19:00",
    meal: "Dinner",
    name: "Seafood Night Market",
    description: "Shared seafood plates with a lively street atmosphere.",
    price: "120k/person",
    rating: "4.7"
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen p-4 text-ink md:p-6">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[230px_1fr]">
        <aside className="rounded-[28px] bg-white/82 p-4 shadow-panel backdrop-blur">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-clay-500 text-white">
              <Utensils size={22} />
            </div>
            <div>
              <p className="text-xl font-bold">FoodTour</p>
              <p className="text-xs text-stone-500">Eat local, feel the street</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <Link
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${
                  item.active
                    ? "bg-clay-50 text-clay-700 shadow-sm"
                    : "text-stone-600 hover:bg-clay-50"
                }`}
                href={item.href}
                key={item.label}
              >
                <item.icon size={19} />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="space-y-5">
          <header className="flex flex-col gap-3 rounded-[28px] bg-white/72 p-4 shadow-panel backdrop-blur md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay-700">
                MVP bootstrap
              </p>
              <h1 className="mt-1 text-3xl font-bold md:text-4xl">
                Food tour planning for Vietnam travel cities
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                className="rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-stone-800"
                href="/login"
              >
                Login
              </Link>
              <Link
                className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-clay-700 shadow-sm transition hover:text-ink"
                href="/register"
              >
                Register
              </Link>
              <Link
                className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-leaf-700 shadow-sm transition hover:text-ink"
                href="/dashboard"
              >
                Dashboard
              </Link>
              <Link
                className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-clay-700 shadow-sm transition hover:text-ink"
                href="/restaurants"
              >
                Restaurants
              </Link>
              <Link
                className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-leaf-700 shadow-sm transition hover:text-ink"
                href="/map"
              >
                Map
              </Link>
              <Link
                className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-clay-700 shadow-sm transition hover:text-ink"
                href="/tour-generator"
              >
                Generate
              </Link>
              <Link
                className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-leaf-700 shadow-sm transition hover:text-ink"
                href="/soundscape"
              >
                Soundscape
              </Link>
              <Link
                className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-clay-700 shadow-sm transition hover:text-ink"
                href="/admin"
              >
                Admin
              </Link>
            </div>
          </header>

          <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-[28px] bg-white/88 p-5 shadow-panel">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-500">Generated itinerary preview</p>
                  <h2 className="text-2xl font-bold">One-day street food route</h2>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-clay-50 px-3 py-2 text-sm font-semibold text-clay-700">
                  <Sparkles size={17} />
                  Rule-based
                </div>
              </div>

              <div className="space-y-4">
                {stops.map((stop) => (
                  <article
                    className="grid gap-4 rounded-2xl border border-clay-100 bg-white p-4 md:grid-cols-[88px_1fr_auto]"
                    key={`${stop.time}-${stop.name}`}
                  >
                    <div>
                      <p className="text-sm text-stone-500">{stop.meal}</p>
                      <p className="text-lg font-bold">{stop.time}</p>
                    </div>
                    <div>
                      <h3 className="font-bold">{stop.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-stone-600">{stop.description}</p>
                    </div>
                    <div className="flex items-center gap-4 md:flex-col md:items-end md:justify-between">
                      <span className="flex items-center gap-1 text-sm font-semibold text-clay-700">
                        <Star size={15} fill="currentColor" />
                        {stop.rating}
                      </span>
                      <span className="rounded-full bg-leaf-500/10 px-3 py-1 text-sm font-semibold text-leaf-700">
                        {stop.price}
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-5 grid gap-3 rounded-2xl bg-clay-50 p-4 text-sm md:grid-cols-3">
                <div>
                  <p className="text-stone-500">Estimated cost</p>
                  <p className="text-xl font-bold">255k/person</p>
                </div>
                <div>
                  <p className="text-stone-500">Travel time</p>
                  <p className="text-xl font-bold">~ 1h 20m</p>
                </div>
                <div>
                  <p className="text-stone-500">Distance</p>
                  <p className="text-xl font-bold">~ 5.8 km</p>
                </div>
              </div>
            </section>

            <section className="grid gap-5">
              <div className="rounded-[28px] bg-white/88 p-5 shadow-panel">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-500">Smart map module</p>
                    <h2 className="text-2xl font-bold">Map placeholder</h2>
                  </div>
                  <MapPinned className="text-clay-500" />
                </div>
                <div className="mt-4 h-72 rounded-3xl border border-clay-100 bg-[linear-gradient(135deg,#f8ead5,#e9f1df)] p-4">
                  <div className="grid h-full place-items-center rounded-2xl border border-dashed border-clay-500/35 bg-white/45 text-center">
                    <Link className="font-bold text-clay-700" href="/map">
                      Open Smart Food Map
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] bg-ink p-5 text-white shadow-panel">
                <p className="text-sm text-clay-100">Health check</p>
                <h2 className="mt-1 text-2xl font-bold">Backend route is ready</h2>
                <p className="mt-2 text-sm leading-6 text-stone-200">
                  Visit <span className="font-mono">/api/health</span> to verify the server route.
                </p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
