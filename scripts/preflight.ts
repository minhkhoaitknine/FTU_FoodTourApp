import "dotenv/config";
import { PrismaClient } from "@prisma/client";

type CheckResult = {
  name: string;
  ok: boolean;
  detail: string;
  severity?: "error" | "warning";
};

const prisma = new PrismaClient();

function result(name: string, ok: boolean, detail: string, severity: "error" | "warning" = "error"): CheckResult {
  return { name, ok, detail, severity };
}

function maskConnectionString(value: string) {
  return value.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
}

function normalizeAppUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed.replace(/^\/+/, "")}`;
}

async function main() {
  const checks: CheckResult[] = [];
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const authSecret = process.env.AUTH_SECRET ?? "";
  const appUrl = normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL ?? "");
  const isProduction = process.env.NODE_ENV === "production";

  checks.push(result("DATABASE_URL", databaseUrl.length > 0, databaseUrl ? maskConnectionString(databaseUrl) : "Missing"));
  checks.push(
    result(
      "AUTH_SECRET",
      isProduction ? authSecret.length >= 32 : authSecret.length > 0,
      isProduction ? "Use at least 32 characters for deployment." : "Configured for local development."
    )
  );
  try {
    checks.push(result("NEXT_PUBLIC_APP_URL", appUrl.length > 0 && Boolean(new URL(appUrl)), appUrl || "Missing"));
  } catch {
    checks.push(result("NEXT_PUBLIC_APP_URL", false, `${appUrl} is not a valid URL.`));
  }

  if (authSecret === "change-this-development-secret") {
    checks.push(result("AUTH_SECRET production safety", false, "Development secret is still configured.", "warning"));
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.push(result("Database connection", true, "PostgreSQL is reachable."));
  } catch (error) {
    checks.push(
      result(
        "Database connection",
        false,
        error instanceof Error ? error.message : "Could not connect to PostgreSQL."
      )
    );
  }

  try {
    const [cities, restaurants, users, reviews, tours, soundscapes] = await Promise.all([
      prisma.city.count(),
      prisma.restaurant.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.review.count({ where: { deletedAt: null } }),
      prisma.foodTour.count({ where: { deletedAt: null } }),
      prisma.soundscape.count({ where: { isActive: true } })
    ]);

    checks.push(result("Seed cities", cities >= 10, `${cities}/10 cities available.`));
    checks.push(result("Seed restaurants", restaurants >= 60, `${restaurants}/60 restaurants available.`));
    checks.push(result("Seed users", users >= 100, `${users}/100 users available.`));
    checks.push(result("Seed reviews", reviews >= 300, `${reviews}/300 reviews available.`));
    checks.push(result("Seed tours", tours >= 40, `${tours}/40 tours available.`));
    checks.push(result("Seed soundscapes", soundscapes >= 10, `${soundscapes}/10 soundscapes available.`));
  } catch (error) {
    checks.push(
      result("Seed data", false, error instanceof Error ? error.message : "Could not inspect seeded data.")
    );
  }

  const failedErrors = checks.filter((check) => !check.ok && check.severity !== "warning");
  const warnings = checks.filter((check) => !check.ok && check.severity === "warning");

  for (const check of checks) {
    const marker = check.ok ? "PASS" : check.severity === "warning" ? "WARN" : "FAIL";
    console.log(`${marker} ${check.name}: ${check.detail}`);
  }

  await prisma.$disconnect();

  if (warnings.length > 0) {
    console.log(`${warnings.length} warning(s) found.`);
  }

  if (failedErrors.length > 0) {
    console.error(`${failedErrors.length} required preflight check(s) failed.`);
    process.exit(1);
  }

  console.log("Preflight checks passed.");
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
