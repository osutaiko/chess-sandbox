import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(timestamp, includeTime = false) {
  const date = new Date(timestamp * 1000);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options) + (includeTime ? `, ${date.toLocaleTimeString('en-US')}` : '');
};

export function formatTime(time, padMinutes = false) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  if (padMinutes) {
    return `${minutes}:${(seconds < 10) ? "0" : ""}${seconds.toFixed(time < 60 ? 1 : 0)}`;
  }
  return `${minutes ? `${minutes}:` : ""}${(minutes && seconds < 10) ? "0" : ""}${seconds.toFixed(time < 60 ? 1 : 0)}`;
}

export function formatEval(cp, mateIn) {
  if (cp !== null) {
    return `${cp >= 0 ? "+" : ""}${(cp / 100).toFixed(2)}`;
  }
  if (mateIn !== null) {
    return `${mateIn > 0 ? "+" : "-"}M${Math.abs(mateIn)}`;
  }
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
