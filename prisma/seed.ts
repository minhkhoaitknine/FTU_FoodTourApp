import { PrismaClient } from "@prisma/client";
import {
  MealType,
  ModerationActionType,
  PriceRange,
  RestaurantType,
  ReviewStatus,
  TourStatus,
  TransportMode,
  UserRole
} from "@prisma/client";
import type { Review } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "FoodTour@123";

class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next() {
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }

  int(min: number, max: number) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  float(min: number, max: number, digits = 6) {
    return Number((this.next() * (max - min) + min).toFixed(digits));
  }

  pick<T>(items: readonly T[]) {
    return items[this.int(0, items.length - 1)];
  }

  sample<T>(items: readonly T[], count: number) {
    const copy = [...items];
    const result: T[] = [];
    while (copy.length > 0 && result.length < count) {
      const index = this.int(0, copy.length - 1);
      result.push(copy.splice(index, 1)[0]);
    }
    return result;
  }
}

const rng = new SeededRandom(20260726);

const cities = [
  { name: "Ha Noi", region: "North", latitude: 21.0278, longitude: 105.8342 },
  { name: "Ho Chi Minh City", region: "South", latitude: 10.7769, longitude: 106.7009 },
  { name: "Da Nang", region: "Central", latitude: 16.0544, longitude: 108.2022 },
  { name: "Hoi An", region: "Central", latitude: 15.8801, longitude: 108.338 },
  { name: "Hue", region: "Central", latitude: 16.4637, longitude: 107.5909 },
  { name: "Nha Trang", region: "Central Coast", latitude: 12.2388, longitude: 109.1967 },
  { name: "Da Lat", region: "Central Highlands", latitude: 11.9404, longitude: 108.4583 },
  { name: "Can Tho", region: "Mekong Delta", latitude: 10.0452, longitude: 105.7469 },
  { name: "Phu Quoc", region: "Island", latitude: 10.2899, longitude: 103.984 },
  { name: "Sa Pa", region: "Northwest", latitude: 22.3364, longitude: 103.8438 }
] as const;

const cuisineTags = [
  "local-food",
  "street-food",
  "seafood",
  "vegetarian",
  "spicy",
  "breakfast",
  "lunch",
  "dinner",
  "coffee",
  "dessert",
  "market",
  "family-friendly",
  "budget",
  "heritage",
  "night-food",
  "noodle"
] as const;

const restaurantConcepts = [
  {
    suffix: "Morning Noodle House",
    type: RestaurantType.LOCAL_EATERY,
    tags: ["noodle", "breakfast", "local-food"],
    menu: ["Pho Bo", "Chicken Noodle Soup", "Fresh Herb Plate", "Iced Tea"],
    vegetarian: false,
    spicy: false
  },
  {
    suffix: "Lantern Banh Mi",
    type: RestaurantType.STREET_FOOD,
    tags: ["street-food", "budget", "lunch"],
    menu: ["Classic Banh Mi", "Egg Banh Mi", "Grilled Pork Skewer", "Soy Milk"],
    vegetarian: false,
    spicy: true
  },
  {
    suffix: "Riverside Seafood Stall",
    type: RestaurantType.MARKET_STALL,
    tags: ["seafood", "dinner", "market"],
    menu: ["Grilled Squid", "Clam Lemongrass Soup", "Garlic Prawns", "Sugarcane Juice"],
    vegetarian: false,
    spicy: true
  },
  {
    suffix: "Garden Vegetarian Kitchen",
    type: RestaurantType.RESTAURANT,
    tags: ["vegetarian", "lunch", "family-friendly"],
    menu: ["Mushroom Hotpot", "Tofu Clay Pot", "Lotus Root Salad", "Herbal Tea"],
    vegetarian: true,
    spicy: false
  },
  {
    suffix: "Old Market Dessert Bar",
    type: RestaurantType.DESSERT_SHOP,
    tags: ["dessert", "market", "snack"],
    menu: ["Che Ba Mau", "Coconut Jelly", "Banana Sweet Soup", "Black Sesame Tea"],
    vegetarian: true,
    spicy: false
  },
  {
    suffix: "Heritage Coffee Corner",
    type: RestaurantType.CAFE,
    tags: ["coffee", "heritage", "snack"],
    menu: ["Egg Coffee", "Salt Coffee", "Robusta Filter Coffee", "Coconut Coffee"],
    vegetarian: true,
    spicy: false
  }
] as const;

const reviewComments = [
  "Good balance between flavor, price and service.",
  "The dish tasted local and the portion was fair.",
  "Nice stop for a short food tour schedule.",
  "Staff was helpful and the menu was easy to understand.",
  "The broth was warm, clean and memorable.",
  "A practical choice for travelers on a moderate budget.",
  "The place felt lively without being too crowded.",
  "Good option if you want a quick local meal.",
  "The herbs and sauces made the meal more interesting.",
  "Worth adding to a demo itinerary."
] as const;

const firstNames = [
  "An",
  "Bao",
  "Chi",
  "Dung",
  "Giang",
  "Hanh",
  "Khoa",
  "Linh",
  "Minh",
  "Nam",
  "Phuong",
  "Quan",
  "Thao",
  "Trang",
  "Vy"
] as const;

const lastNames = ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Vo", "Dang", "Bui"] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function uniqueStrings(values: readonly string[]) {
  return Array.from(new Set(values));
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

function pickPriceRange(index: number) {
  if (index % 9 === 0) return PriceRange.PREMIUM;
  if (index % 3 === 0) return PriceRange.MODERATE;
  return PriceRange.BUDGET;
}

function priceForRange(priceRange: PriceRange) {
  if (priceRange === PriceRange.PREMIUM) return rng.int(120_000, 260_000);
  if (priceRange === PriceRange.MODERATE) return rng.int(55_000, 130_000);
  return rng.int(20_000, 65_000);
}

function openingHoursFor(index: number) {
  return Array.from({ length: 7 }, (_, dayOfWeek) => {
    if (index % 13 === 0 && dayOfWeek === 1) {
      return { dayOfWeek, openTime: "00:00", closeTime: "00:00", isClosed: true };
    }

    if (index % 10 === 0) {
      return { dayOfWeek, openTime: "06:00", closeTime: "11:00", isClosed: false };
    }

    if (index % 11 === 0) {
      return { dayOfWeek, openTime: "17:00", closeTime: "23:30", isClosed: false };
    }

    if (index % 7 === 0) {
      return {
        dayOfWeek,
        openTime: "07:00",
        closeTime: "21:30",
        breakStart: "14:00",
        breakEnd: "16:30",
        isClosed: false
      };
    }

    return { dayOfWeek, openTime: "07:00", closeTime: "22:00", isClosed: false };
  });
}

async function clearDatabase() {
  await prisma.$transaction([
    prisma.moderationAction.deleteMany(),
    prisma.foodTourStop.deleteMany(),
    prisma.foodTour.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.reviewImage.deleteMany(),
    prisma.review.deleteMany(),
    prisma.menuItem.deleteMany(),
    prisma.menuCategory.deleteMany(),
    prisma.openingHour.deleteMany(),
    prisma.restaurantTag.deleteMany(),
    prisma.restaurantImage.deleteMany(),
    prisma.soundscape.deleteMany(),
    prisma.restaurant.deleteMany(),
    prisma.userPreference.deleteMany(),
    prisma.user.deleteMany(),
    prisma.city.deleteMany()
  ]);
}

async function seedUsers(passwordHash: string) {
  const demoUsers = [
    {
      email: "admin@foodtour.demo",
      fullName: "FoodTour Admin",
      role: UserRole.ADMIN
    },
    {
      email: "moderator@foodtour.demo",
      fullName: "FoodTour Moderator",
      role: UserRole.MODERATOR
    },
    {
      email: "user@foodtour.demo",
      fullName: "FoodTour User",
      role: UserRole.USER
    }
  ];

  const generatedUsers = Array.from({ length: 97 }, (_, index) => {
    const fullName = `${rng.pick(firstNames)} ${rng.pick(lastNames)} ${index + 1}`;
    return {
      email: `demo.user.${String(index + 1).padStart(3, "0")}@foodtour.demo`,
      fullName,
      role: UserRole.USER
    };
  });

  const users = [];
  for (const user of [...demoUsers, ...generatedUsers]) {
    const created = await prisma.user.create({
      data: {
        email: user.email,
        fullName: user.fullName,
        passwordHash,
        role: user.role,
        avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.fullName)}`,
        preference: {
          create: {
            spicyLevel: rng.int(0, 5),
            vegetarian: rng.next() > 0.78,
            preferredPriceRange: rng.pick([PriceRange.BUDGET, PriceRange.MODERATE, PriceRange.PREMIUM]),
            preferredTransport: rng.pick([
              TransportMode.WALKING,
              TransportMode.BICYCLE,
              TransportMode.MOTORBIKE,
              TransportMode.CAR,
              TransportMode.PUBLIC_TRANSIT
            ]),
            cuisines: rng.sample(cuisineTags, rng.int(3, 6)),
            allergies: rng.sample(["peanut", "seafood", "dairy", "egg", "soy"], rng.int(0, 2))
          }
        }
      }
    });
    users.push(created);
  }

  return users;
}

async function seedCities() {
  const createdCities = [];
  for (const city of cities) {
    createdCities.push(
      await prisma.city.create({
        data: city
      })
    );
  }
  return createdCities;
}

async function seedRestaurants(createdCities: Awaited<ReturnType<typeof seedCities>>) {
  const restaurants = [];
  let globalIndex = 0;

  for (const city of createdCities) {
    for (const concept of restaurantConcepts) {
      globalIndex += 1;
      const priceRange = pickPriceRange(globalIndex);
      const minPrice = priceForRange(priceRange);
      const maxPrice = minPrice + rng.int(25_000, 140_000);
      const name = `${city.name} ${concept.suffix}`;
      const restaurant = await prisma.restaurant.create({
        data: {
          cityId: city.id,
          name,
          slug: `${slugify(city.name)}-${slugify(concept.suffix)}`,
          description: `Fictitious demo venue for ${city.name}, created for FoodTour Generator presentations.`,
          culturalStory: `Demo cultural note about how travelers can explore ${city.name} through local food.`,
          eatingTips: "Order a signature dish, check the opening time, and plan travel time between stops.",
          address: `${rng.int(1, 220)} Demo Food Street, ${city.name}`,
          latitude: Number((city.latitude + rng.float(-0.035, 0.035)).toFixed(6)),
          longitude: Number((city.longitude + rng.float(-0.035, 0.035)).toFixed(6)),
          type: concept.type,
          priceRange,
          averageMealMinutes: rng.int(25, 70),
          minPrice,
          maxPrice,
          isVegetarianFriendly: concept.vegetarian || rng.next() > 0.72,
          isSpicy: concept.spicy,
          isActive: globalIndex % 17 !== 0,
          images: {
            create: [
              {
                url: `/images/demo/restaurants/${slugify(name)}.jpg`,
                alt: `${name} demo food image`,
                sortOrder: 1
              }
            ]
          },
          tags: {
            create: rng.sample(uniqueStrings([...concept.tags, ...cuisineTags]), rng.int(4, 7)).map((tag) => ({
              name: tag
            }))
          },
          openingHours: {
            create: openingHoursFor(globalIndex)
          },
          menuCategories: {
            create: [
              {
                name: "Signature dishes",
                sortOrder: 1,
                items: {
                  create: concept.menu.map((itemName, itemIndex) => ({
                    name: itemName,
                    description: `Demo menu item for ${name}.`,
                    price: Math.max(15_000, minPrice + itemIndex * rng.int(8_000, 25_000)),
                    isVegetarian: concept.vegetarian || itemName.toLowerCase().includes("tofu"),
                    isSpicy: concept.spicy && itemIndex % 2 === 0,
                    allergens: itemName.toLowerCase().includes("seafood") || [...concept.tags].includes("seafood")
                      ? ["seafood"]
                      : rng.sample(["peanut", "dairy", "egg", "soy"], rng.int(0, 1))
                  }))
                }
              }
            ]
          }
        }
      });
      restaurants.push(restaurant);
    }
  }

  return restaurants;
}

async function seedReviews(users: Awaited<ReturnType<typeof seedUsers>>, restaurants: Awaited<ReturnType<typeof seedRestaurants>>) {
  const pairs = new Set<string>();
  const reviews: Review[] = [];

  while (reviews.length < 300) {
    const user = rng.pick(users);
    const restaurant = rng.pick(restaurants);
    const key = `${user.id}:${restaurant.id}`;
    if (pairs.has(key)) continue;
    pairs.add(key);

    const rating = rng.int(3, 5);
    const status: ReviewStatus =
      reviews.length % 31 === 0
        ? ReviewStatus.HIDDEN
        : reviews.length % 23 === 0
          ? ReviewStatus.FLAGGED
          : reviews.length % 19 === 0
            ? ReviewStatus.PENDING
            : ReviewStatus.PUBLISHED;

    reviews.push(
      await prisma.review.create({
        data: {
          userId: user.id,
          restaurantId: restaurant.id,
          rating,
          status,
          comment: `${rng.pick(reviewComments)} Rating: ${rating}/5.`
        }
      })
    );
  }

  for (const restaurant of restaurants) {
    const publishedReviews = reviews.filter(
      (review) => review.restaurantId === restaurant.id && review.status === ReviewStatus.PUBLISHED
    );
    const ratingCount = publishedReviews.length;
    const ratingAverage =
      ratingCount === 0
        ? 0
        : Number(
            (publishedReviews.reduce((sum, review) => sum + review.rating, 0) / ratingCount).toFixed(2)
          );

    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: { ratingAverage, ratingCount }
    });
  }

  return reviews;
}

async function seedFavorites(users: Awaited<ReturnType<typeof seedUsers>>, restaurants: Awaited<ReturnType<typeof seedRestaurants>>) {
  const favorites = new Set<string>();
  while (favorites.size < 180) {
    const user = rng.pick(users);
    const restaurant = rng.pick(restaurants);
    favorites.add(`${user.id}:${restaurant.id}`);
  }

  for (const favorite of favorites) {
    const [userId, restaurantId] = favorite.split(":");
    await prisma.favorite.create({
      data: { userId, restaurantId }
    });
  }
}

async function seedFoodTours(users: Awaited<ReturnType<typeof seedUsers>>, createdCities: Awaited<ReturnType<typeof seedCities>>) {
  const restaurants = await prisma.restaurant.findMany({
    include: { city: true }
  });

  for (let index = 0; index < 40; index += 1) {
    const user = users[index % users.length];
    const city = createdCities[index % createdCities.length];
    const cityRestaurants = restaurants.filter((restaurant) => restaurant.cityId === city.id);
    const stops = rng.sample(cityRestaurants, 4);
    const startAt = new Date(Date.UTC(2026, 6, 1 + (index % 20), 0, 30));
    const stopTimes = [0, 250, 480, 690];
    const totalCost = stops.reduce((sum, stop) => sum + Math.round((stop.minPrice + stop.maxPrice) / 2), 0);

    await prisma.foodTour.create({
      data: {
        userId: user.id,
        cityId: city.id,
        title: `${city.name} demo food tour ${index + 1}`,
        startAddress: `Demo start point, ${city.name}`,
        startLatitude: city.latitude,
        startLongitude: city.longitude,
        startAt,
        durationHours: 12,
        numberOfDays: 1,
        numberOfPeople: rng.int(1, 5),
        budget: totalCost + rng.int(80_000, 300_000),
        transportMode: rng.pick([TransportMode.WALKING, TransportMode.MOTORBIKE, TransportMode.CAR]),
        preferences: {
          preferredTags: rng.sample(cuisineTags, 4),
          maxDistanceKm: rng.int(4, 15),
          allergySafeMode: true
        },
        totalCost,
        totalDistanceKm: Number(rng.float(3.2, 16.5, 2)),
        totalTravelMinutes: rng.int(45, 150),
        status: rng.pick([TourStatus.SAVED, TourStatus.COMPLETED]),
        stops: {
          create: stops.map((stop, stopIndex) => ({
            restaurantId: stop.id,
            stopOrder: stopIndex + 1,
            mealType: [MealType.BREAKFAST, MealType.LUNCH, MealType.SNACK, MealType.DINNER][stopIndex],
            plannedArrivalAt: addMinutes(startAt, stopTimes[stopIndex]),
            estimatedMealMinutes: stop.averageMealMinutes,
            estimatedTravelMinutes: stopIndex === 0 ? 0 : rng.int(10, 35),
            distanceFromPreviousKm: stopIndex === 0 ? 0 : Number(rng.float(0.4, 4.8, 2)),
            estimatedCost: Math.round((stop.minPrice + stop.maxPrice) / 2),
            reason: "Selected by demo rule-based scoring for preference, budget and route balance."
          }))
        }
      }
    });
  }
}

async function seedSoundscapes(createdCities: Awaited<ReturnType<typeof seedCities>>) {
  for (const city of createdCities) {
    await prisma.soundscape.create({
      data: {
        cityId: city.id,
        title: `${city.name} street ambience demo`,
        audioUrl: `/audio/demo/${slugify(city.name)}-street-ambience.mp3`,
        attribution: "Placeholder demo audio. Replace with public-domain or properly licensed assets before production."
      }
    });
  }
}

async function seedModeration(users: Awaited<ReturnType<typeof seedUsers>>, reviews: Awaited<ReturnType<typeof seedReviews>>) {
  const moderator = users.find((user) => user.role === UserRole.MODERATOR);
  if (!moderator) return;

  const moderationStatuses: ReviewStatus[] = [ReviewStatus.HIDDEN, ReviewStatus.FLAGGED];
  const moderatedReviews = reviews.filter((review) => moderationStatuses.includes(review.status));

  for (const review of moderatedReviews.slice(0, 18)) {
    await prisma.moderationAction.create({
      data: {
        moderatorId: moderator.id,
        reviewId: review.id,
        action: review.status === ReviewStatus.HIDDEN ? ModerationActionType.HIDE_REVIEW : ModerationActionType.FLAG_REVIEW,
        reason: "Demo moderation action for admin review workflow."
      }
    });
  }
}

async function main() {
  console.log("Resetting demo database...");
  await clearDatabase();

  console.log("Creating demo accounts and users...");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users = await seedUsers(passwordHash);

  console.log("Creating cities, restaurants, menus and opening hours...");
  const createdCities = await seedCities();
  const restaurants = await seedRestaurants(createdCities);

  console.log("Creating reviews, favorites, tours and soundscapes...");
  const reviews = await seedReviews(users, restaurants);
  await seedFavorites(users, restaurants);
  await seedFoodTours(users, createdCities);
  await seedSoundscapes(createdCities);
  await seedModeration(users, reviews);

  console.log("Seed complete.");
  console.table({
    cities: createdCities.length,
    restaurants: restaurants.length,
    users: users.length,
    reviews: reviews.length,
    demoPassword: DEMO_PASSWORD
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
