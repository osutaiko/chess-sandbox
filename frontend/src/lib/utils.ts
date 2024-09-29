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
    return `${minutes}:${(seconds < 10) ? "0" : ""}${seconds}${time < 100 ? `.${tenths}` : ""}`;
  }
  return `${minutes ? `${minutes}:` : ""}${(minutes && seconds < 10) ? "0" : ""}${seconds}.${tenths}`;
}

function tcnToObjects(e) {
  var T = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?{~}(^)[_]@#$,./&-*++=";
  var c, a, g = e.length, f = [];
  for (c = 0; c < g; c += 2) {
    var d = {}, b = T.indexOf(e[c]);
    63 < (a = T.indexOf(e[c + 1])) && (d.promotion = "qnrbkp"[Math.floor((a - 64) / 3)], a = b + (16 > b ? -8 : 8) + (a - 1) % 3 - 1);
    75 < b ? d.drop = "qnrbkp"[b - 79] : d.from = T[b % 8] + (Math.floor(b / 8) + 1);
    d.to = T[a % 8] + (Math.floor(a / 8) + 1);
    f.push(d);
  }
  return f;
}

export function tcnToAlgebraics(tcn) {
  const moveList = tcnToObjects(tcn);
  let chess = new Chess();
  moveList.forEach((move) => chess.move(move));
  return chess.pgn().replace(/\d+\.\s*/g, '').split(' ');
}