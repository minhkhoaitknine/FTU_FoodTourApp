const ASSET_BASE_PATH = "/images/demo";

export type ImageAssetKind = "city" | "food" | "restaurant";

export type ResolvedImageAsset = {
  src: string;
  alt: string;
  kind: ImageAssetKind;
  source: "exact" | "fallback" | "provided-url";
};

const cityFiles = [
  "Can Tho.jpg",
  "Da Lat 2.jpg",
  "Da Lat.jpg",
  "Da Nang 2.jpg",
  "Da Nang.jpg",
  "Ha Noi 2.jpg",
  "Ha Noi 3.jfif",
  "Ha Noi.jpeg",
  "Ho Chi Minh City 2.jfif",
  "Ho Chi Minh City.jpg",
  "Hoi An 2.jpg",
  "Hoi An.jfif",
  "Hue 1.jpg",
  "nha trang 1.jpg",
  "Nha Trang.jpg",
  "Phu Quoc 2.jpg",
  "phu quoc.jpg",
  "Sa Pa.jpg"
] as const;

const foodFiles = [
  "Banana Sweet Soup.jpg",
  "Black Sesame Tea.jpg",
  "Che Ba Mau.jfif",
  "Chicken Noodle Soup.jfif",
  "Clam Lemongrass Soup.jpg",
  "Classic Banh Mi.jpg",
  "Coconut Coffee.jpeg",
  "Coconut Coffee.jpg",
  "Coconut Jelly.jfif",
  "Egg Banh Mi.jpg",
  "Egg Coffee.jfif",
  "Fresh Herb Plate.jfif",
  "Garlic Prawns.jfif",
  "Grilled Pork Skewer.jpg",
  "Grilled Squid.jfif",
  "Herbal Tea.jfif",
  "Iced Tea.jpg",
  "Lotus Root Salad.jpg",
  "Mushroom Hotpot.jfif",
  "Pho Bo.jpg",
  "Robusta Filter Coffee.jpg",
  "Salt Coffee.jpg",
  "Soy Milk.jpg",
  "Sugarcane Juice.jpg",
  "Tofu Clay Pot.jfif"
] as const;

const restaurantFiles = [
  "Can Tho Garden Vegetarian Kitchen.jpg",
  "Can Tho Heritage Coffee Corner.jpg",
  "Can Tho Lantern Banh Mi.jfif",
  "Can Tho Morning Noodle House.jfif",
  "Can Tho Old Market Dessert Bar.jpg",
  "Can Tho Riverside Seafood Stall.jpg",
  "Da Lat Garden Vegetarian Kitchen.jpg",
  "Da Lat Heritage Coffee Corner.jpg",
  "Da Lat Lantern Banh Mi.jpg",
  "Da Lat Morning Noodle House.jpg",
  "Da Lat Old Market Dessert Bar.jpg",
  "Da Lat Riverside Seafood Stall.jpg",
  "Da Nang Garden Vegetarian Kitchen.jpg",
  "Da Nang Heritage Coffee Corner.jpg",
  "Da Nang Lantern Banh Mi.jfif",
  "Da Nang Morning Noodle House.jpg",
  "Da Nang Old Market Dessert Bar.jpg",
  "Da Nang Riverside Seafood Stall.jfif",
  "Ha Noi Garden Vegetarian Kitchen.jfif",
  "Ha Noi Heritage Coffee Corner.png",
  "Ha Noi Lantern Banh Mi.jpg",
  "Ha Noi Morning Noodle House.jpg",
  "Ha Noi Old Market Dessert Bar.jpg",
  "Ha Noi Riverside Seafood Stall.png",
  "Ho Chi Minh City Garden Vegetarian Kitchen.jfif",
  "Ho Chi Minh City Heritage Coffee Corner.jpg",
  "Ho Chi Minh City Lantern Banh Mi.jpg",
  "Ho Chi Minh City Morning Noodle House.jpg",
  "Ho Chi Minh City Old Market Dessert Bar.jpg",
  "Ho Chi Minh City Riverside Seafood Stall.jpg",
  "Hoi An Garden Vegetarian Kitchen.jfif",
  "Hoi An Heritage Coffee Corner.jpg",
  "Hoi An Lantern Banh Mi.jpg",
  "Hoi An Morning Noodle House.jpg",
  "Hoi An Old Market Dessert Bar.jpg",
  "Hoi An Riverside Seafood Stall.jpg",
  "Hue Garden Vegetarian Kitchen.jpg",
  "Hue Heritage Coffee Corner.jpg",
  "Hue Lantern Banh Mi.jfif",
  "Hue Morning Noodle House.jpg",
  "Hue Old Market Dessert Bar.jpg",
  "Hue Riverside Seafood Stall.jfif",
  "Nha Trang Garden Vegetarian Kitchen.jpg",
  "Nha Trang Heritage Coffee Corner.jpg",
  "Nha Trang Lantern Banh Mi.jfif",
  "Nha Trang Morning Noodle House.jpg",
  "Nha Trang Old Market Dessert Bar.jpg",
  "Nha Trang Riverside Seafood Stall.jpg",
  "Phu Quoc Garden Vegetarian Kitchen.jpg",
  "Phu Quoc Heritage Coffee Corner.jpg",
  "Phu Quoc Lantern Banh Mi.jpeg",
  "Phu Quoc Morning Noodle House.png",
  "Phu Quoc Old Market Dessert Bar.jpg",
  "Phu Quoc Riverside Seafood Stall.jpg",
  "Sa Pa Garden Vegetarian Kitchen.jpg",
  "Sa Pa Heritage Coffee Corner.jpg",
  "Sa Pa Lantern Banh Mi.jfif",
  "Sa Pa Morning Noodle House.jpg",
  "Sa Pa Old Market Dessert Bar.jpg",
  "Sa Pa Riverside Seafood Stall.jpg"
] as const;

export const DEFAULT_FOOD_IMAGE_SRC = assetSrc("food", "Pho Bo.jpg");
export const DEFAULT_RESTAURANT_IMAGE_SRC = assetSrc(
  "restaurant",
  "Hoi An Morning Noodle House.jpg"
);
export const DEFAULT_CITY_IMAGE_SRC = assetSrc("city", "Hoi An 2.jpg");

const foodKeywordFallbacks: Array<[string[], string]> = [
  [["coffee", "cafe", "ca phe"], "Egg Coffee.jfif"],
  [["dessert", "sweet", "che"], "Che Ba Mau.jfif"],
  [["seafood", "riverside", "squid", "prawn"], "Grilled Squid.jfif"],
  [["vegetarian", "garden", "tofu"], "Tofu Clay Pot.jfif"],
  [["banh mi", "lantern"], "Classic Banh Mi.jpg"],
  [["noodle", "pho", "morning"], "Pho Bo.jpg"]
];

const cityIndex = createAssetIndex("city", cityFiles);
const foodIndex = createAssetIndex("food", foodFiles);
const restaurantIndex = createAssetIndex("restaurant", restaurantFiles);

export function resolveCityImage(cityName?: string | null): ResolvedImageAsset {
  const exact = findCityImage(cityName);
  if (exact) {
    return {
      src: exact,
      alt: `${cityName} travel background`,
      kind: "city",
      source: "exact"
    };
  }

  return {
    src: DEFAULT_CITY_IMAGE_SRC,
    alt: "Vietnam travel city background",
    kind: "city",
    source: "fallback"
  };
}

export function resolveFoodImage(input?: {
  name?: string | null;
  tags?: readonly string[] | null;
}): ResolvedImageAsset {
  const name = input?.name?.trim();
  const exact = name ? foodIndex.get(normalizeAssetKey(name)) : undefined;
  if (exact) {
    return {
      src: exact,
      alt: `${name} food photo`,
      kind: "food",
      source: "exact"
    };
  }

  const lookupText = normalizeAssetKey([name, ...(input?.tags ?? [])].filter(Boolean).join(" "));
  const fallbackFile = foodKeywordFallbacks.find(([keywords]) =>
    keywords.some((keyword) => lookupText.includes(normalizeAssetKey(keyword)))
  )?.[1];

  return {
    src: fallbackFile ? assetSrc("food", fallbackFile) : DEFAULT_FOOD_IMAGE_SRC,
    alt: name ? `${name} food photo` : "Vietnamese food photo",
    kind: "food",
    source: "fallback"
  };
}

export function resolveRestaurantImage(input: {
  name: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  tags?: readonly string[] | null;
}): ResolvedImageAsset {
  const exact = restaurantIndex.get(normalizeAssetKey(input.name));
  if (exact) {
    return {
      src: exact,
      alt: input.imageAlt?.trim() || `${input.name} restaurant photo`,
      kind: "restaurant",
      source: "exact"
    };
  }

  if (input.imageUrl && !isLegacySeedRestaurantUrl(input.imageUrl)) {
    return {
      src: input.imageUrl,
      alt: input.imageAlt?.trim() || `${input.name} restaurant photo`,
      kind: "restaurant",
      source: "provided-url"
    };
  }

  const foodFallback = resolveFoodImage({ name: input.name, tags: input.tags });
  return {
    src: foodFallback.src || DEFAULT_RESTAURANT_IMAGE_SRC,
    alt: input.imageAlt?.trim() || `${input.name} restaurant photo`,
    kind: "restaurant",
    source: "fallback"
  };
}

export function listImageAssets(kind: ImageAssetKind) {
  if (kind === "city") return cityFiles.map((file) => assetSrc(kind, file));
  if (kind === "food") return foodFiles.map((file) => assetSrc(kind, file));
  return restaurantFiles.map((file) => assetSrc(kind, file));
}

function findCityImage(cityName?: string | null) {
  if (!cityName) return undefined;

  const candidates = [
    cityName,
    `${cityName} 1`,
    `${cityName} 2`,
    `${cityName} 3`
  ].map(normalizeAssetKey);

  for (const candidate of candidates) {
    const match = cityIndex.get(candidate);
    if (match) return match;
  }

  return undefined;
}

function createAssetIndex(kind: ImageAssetKind, files: readonly string[]) {
  const index = new Map<string, string>();

  for (const file of files) {
    const stem = stripExtension(file);
    const key = normalizeAssetKey(stem);
    const existing = index.get(key);
    if (!existing || /\s[1-9]$/.test(stem)) {
      index.set(key, assetSrc(kind, file));
    }
  }

  return index;
}

function assetSrc(kind: ImageAssetKind, fileName: string) {
  return `${ASSET_BASE_PATH}/${kind}/${encodeURIComponent(fileName)}`;
}

function stripExtension(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}

function normalizeAssetKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function isLegacySeedRestaurantUrl(url: string) {
  return url.startsWith("/images/demo/restaurants/");
}
