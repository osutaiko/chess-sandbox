const images: Record<string, string> = {};

const importImages = import.meta.glob("./images/pieces/*.svg", { eager: true });

for (const path in importImages) {
  const fileName = path.replace("./images/pieces/", "").replace(".svg", "");
  images[`pieces/${fileName}`] = (importImages[path] as any).default;
}

export default images;
