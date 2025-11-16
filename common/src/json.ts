
export function stringify(obj: any): string {
  return JSON.stringify(obj, (_key, value) => {
    if (value === Infinity || value === "Infinity" || value === "∞") {
      return "Infinity";
    }
    return value;
  });
}

export function parse(str: string): any {
  return JSON.parse(str, (_key, value) => {
    if (value === "Infinity") {
      return Infinity;
    }
    return value;
  });
}
