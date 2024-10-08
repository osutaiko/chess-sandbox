import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/-/g, '.');
};

export function formatTime(time, padMinutes = false) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  if (padMinutes) {
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds.toFixed(time < 60 ? 1 : 0)}`;
  }
  return `${minutes ? `${minutes}:` : ""}${(minutes && seconds < 10) ? "0" : ""}${seconds.toFixed(1)}`;
}

export function formatDailyTime(time) {
  const days = Math.floor(time / 86400);
  const hours = Math.floor((time - days) / 3600);
  const minutes = Math.round((time % 3600) / 60);

  return `${days > 0 ? `${days}d` : ""} ${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
}

export function formatEval({cp, mateIn}) {
  if (cp !== null) {
    return `${cp >= 0 ? "+" : ""}${(cp / 100).toFixed(2)}`;
  }
  if (mateIn !== null) {
    return `${mateIn > 0 ? "+" : "-"}M${Math.abs(mateIn)}`;
  }
};

export const capitalizeString = (string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export function evalToWhiteWinProb({cp, mateIn}) {
  if (cp !== null) {
    return 1 / (1 + Math.exp(-0.005 * cp));
  }
  if (mateIn !== null) {
    if (mateIn > 0) {
      return 1;
    } else {
      return 0;
    }
  }
  return 0.5;
};

export const getMoveCategoryBgColor = (moveCategory) => {
  switch (moveCategory) {
    case "brilliant":
      return "bg-brilliant";
    case "blunder":
      return "bg-blunder";
    case "mistake":
      return "bg-mistake";
    case "inaccuracy":
      return "bg-inaccuracy";
    default:
      return "";
  }
};

export const getMoveCategoryTextColor = (moveCategory) => {
  switch (moveCategory) {
    case "brilliant":
      return "text-brilliant";
    case "blunder":
      return "text-blunder";
    case "mistake":
      return "text-mistake";
    case "inaccuracy":
      return "text-inaccuracy";
    default:
      return "";
  }
};

export const getMoveCategorySuffix = (moveCategory) => {
  switch (moveCategory) {
    case "brilliant":
      return "!!";
    case "blunder":
      return "??";
    case "mistake":
      return "?";
    case "inaccuracy":
      return "?!";
    default:
      return "";
  }
};

export const createWinProbLossBuckets = (step) => {
  const buckets = [{
    range: "0",
    white: 0,
    black: 0,
  }];
  for (let i = 0; i < 0.2 - step; i += step) {
    buckets.push({
      range: `${Math.round(i * 100)}-${Math.round((i + step) * 100)}`,
      white: 0,
      black: 0,
    });
  }
  buckets.push({
    range: ">20",
    white: 0,
    black: 0,
  })
  return buckets;
};
