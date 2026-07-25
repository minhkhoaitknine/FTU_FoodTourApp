export type OpeningHourLike = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
  isClosed: boolean;
};

function minutesFromTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function isWithinWindow(currentMinutes: number, openMinutes: number, closeMinutes: number) {
  if (openMinutes === closeMinutes) return false;
  if (closeMinutes > openMinutes) {
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }

  return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
}

export function isOpenAt(openingHours: OpeningHourLike[], date: Date) {
  const dayOfWeek = date.getDay();
  const hour = openingHours.find((item) => item.dayOfWeek === dayOfWeek);
  if (!hour || hour.isClosed) return false;

  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const openMinutes = minutesFromTime(hour.openTime);
  const closeMinutes = minutesFromTime(hour.closeTime);
  const insideOpeningWindow = isWithinWindow(currentMinutes, openMinutes, closeMinutes);

  if (!insideOpeningWindow) return false;

  if (hour.breakStart && hour.breakEnd) {
    const breakStart = minutesFromTime(hour.breakStart);
    const breakEnd = minutesFromTime(hour.breakEnd);
    if (isWithinWindow(currentMinutes, breakStart, breakEnd)) return false;
  }

  return true;
}

