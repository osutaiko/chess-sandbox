import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Chess } from "chess.js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(timestamp, includeTime = false) {
  const date = new Date(timestamp * 1000);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options) + (includeTime ? `, ${date.toLocaleTimeString('en-US')}` : '');
};

export function formatTime(time, padMinutes = false) {
  const minutes = Math.floor(time / 600)
  const seconds = Math.floor((time % 600) / 10);
  const tenths = Math.round(time % 10);

  if (padMinutes) {
    return `${minutes}:${(seconds < 10) ? "0" : ""}${seconds}${time < 600 ? `.${tenths}` : ""}`;
  }
  return `${minutes ? `${minutes}:` : ""}${(minutes && seconds < 10) ? "0" : ""}${seconds}.${tenths}`;
}

function tcnToObjects(e, castlingRights) {
  var T = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?{~}(^)[_]@#$,./&-*++=";
  var c, a, g = e.length, f = [];
  for (c = 0; c < g; c += 2) {
    var d = {}, b = T.indexOf(e[c]);
    63 < (a = T.indexOf(e[c + 1])) && (d.promotion = "qnrbkp"[Math.floor((a - 64) / 3)], a = b + (16 > b ? -8 : 8) + (a - 1) % 3 - 1);
    75 < b ? d.drop = "qnrbkp"[b - 79] : d.from = T[b % 8] + (Math.floor(b / 8) + 1);
    d.to = T[a % 8] + (Math.floor(a / 8) + 1);

    // Check for castling move using passed castling rights
    if (d.from === 'e1' && (d.to === 'h1' || d.to === 'a1')) {
      if (d.to === 'h1' && castlingRights.white.k) d.to = 'g1'; // Kingside white castling
      if (d.to === 'a1' && castlingRights.white.q) d.to = 'c1'; // Queenside white castling
    }

    if (d.from === 'e8' && (d.to === 'h8' || d.to === 'a8')) {
      if (d.to === 'h8' && castlingRights.black.k) d.to = 'g8'; // Kingside black castling
      if (d.to === 'a8' && castlingRights.black.q) d.to = 'c8'; // Queenside black castling
    }

    f.push(d);
  }
  return f;
}

export function tcnToAlgebraics(tcn) {
  let chess = new Chess();
  const castlingRights = {
    white: chess.getCastlingRights('w'),
    black: chess.getCastlingRights('b')
  };

  const moveList = tcnToObjects(tcn, castlingRights);
  moveList.forEach((move) => chess.move(move));
  return chess.pgn().replace(/\d+\.\s*/g, '').split(' ');
}

export function formatEval(cp, mateIn) {
  if (cp !== null) {
    return `${cp >= 0 ? "+" : ""}${(cp / 100).toFixed(2)}`;
  }
  if (mateIn !== null) {
    return `${mateIn > 0 ? "+" : "-"}M${Math.abs(mateIn)}`;
  }
}

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
}

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
}

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
}

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
}