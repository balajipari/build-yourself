export const getImageFormats = (src: string) => {
  const basePath = src.replace(/\.[^/.]+$/, ''); // Remove extension
  return {
    webp: `${basePath}.webp`,
    avif: `${basePath}.avif`,
    fallback: `${basePath}.jpg`
  };
};
