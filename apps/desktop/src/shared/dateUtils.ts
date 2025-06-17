export function timeDifferenceInMs(startTime: string, endTime: string): number {
  const startDateTime = timeToDate(startTime);
  const endDateTime = timeToDate(endTime);
  return endDateTime.getTime() - startDateTime.getTime();
}

export function timeToDate(time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function timeAdd(time: string, ms: number): Date {
  const date = timeToDate(time);
  date.setTime(date.getTime() + ms);
  return date;
}

export function todayAsName(): string {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return daysOfWeek[new Date().getDay()];
}
