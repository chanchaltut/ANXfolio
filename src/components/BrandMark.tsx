import type { Brand } from "@/content/types";

/** Logo when a file exists, otherwise a typed wordmark. Logos render monochrome so the row reads as one set. */
export function BrandMark({ brand, large = false }: { brand: Brand; large?: boolean }) {
  if (!brand.logo) {
    return <span className={`brand-type${large ? " brand-type--lg" : ""}`}>{brand.name}</span>;
  }
  const ratio = brand.logo.width / brand.logo.height;
  const maxW = large ? 190 : 112;
  const maxH = large ? 40 : 22;
  const height = Math.min(maxH, maxW / ratio);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG, nothing for the optimizer to do
    <img
      className="brand-logo"
      src={brand.logo.src}
      alt={brand.name}
      width={Math.round(height * ratio)}
      height={Math.round(height)}
      loading="lazy"
    />
  );
}
