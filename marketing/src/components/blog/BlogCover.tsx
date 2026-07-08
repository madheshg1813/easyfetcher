import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import { IMAGES } from "@/lib/cloudinary";

const LOGO_MAP: Record<string, string> = {
  claude: IMAGES.destinations.claude,
  chatgpt: IMAGES.destinations.chatgpt,
  perplexity: IMAGES.destinations.perplexity,
  gemini: IMAGES.destinations.gemini,
};

// Branded cover generated from post data — no image upload required.
// Priority: uploaded coverImage → creative label/logo cover → title fallback.
export default function BlogCover({
  title,
  category,
  coverImage,
  coverLabel,
  coverLogo,
  size = "card",
}: {
  title: string;
  category?: string;
  coverImage?: unknown;
  coverLabel?: string;
  coverLogo?: string;
  size?: "card" | "feature" | "hero";
}) {
  if (coverImage) {
    const url = urlFor(coverImage).width(1200).height(700).fit("crop").url();
    return (
      <div className={`relative w-full overflow-hidden ${aspect(size)}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={title} className="w-full h-full object-cover" />
      </div>
    );
  }

  const logo = coverLogo ? LOGO_MAP[coverLogo] : undefined;
  const logoSize = size === "hero" ? "w-16 h-16 sm:w-20 sm:h-20" : size === "feature" ? "w-14 h-14 sm:w-16 sm:h-16" : "w-12 h-12";
  const labelSize = size === "hero" ? "text-5xl sm:text-6xl" : size === "feature" ? "text-4xl sm:text-5xl" : "text-3xl";
  const titleSize = size === "hero" ? "text-3xl sm:text-4xl" : size === "feature" ? "text-2xl sm:text-3xl" : "text-xl";

  return (
    <div
      className={`relative w-full overflow-hidden ${aspect(size)} flex flex-col p-6 sm:p-7`}
      style={{ background: "linear-gradient(145deg, #0e1b2f 0%, #16283f 55%, #1c3050 100%)" }}
    >
      {/* soft glow */}
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, #D97757 0%, transparent 70%)" }}
      />

      {/* brand mark */}
      <div className="relative flex items-center gap-2">
        <Image src="/ef-icon.png" alt="Easy Fetcher" width={22} height={22} className="h-5 w-5 object-contain" />
        <span className="text-white/70 text-xs font-semibold tracking-tight">Easy Fetcher Blog</span>
      </div>

      {/* Creative label+logo cover, else fall back to the title */}
      {coverLabel ? (
        <div className="relative flex-1 flex items-center justify-center gap-4 sm:gap-5">
          {logo && (
            <span className={`${logoSize} rounded-2xl bg-white shadow-lg flex items-center justify-center shrink-0`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt="" className="w-2/3 h-2/3 object-contain" />
            </span>
          )}
          <span className={`text-white font-black tracking-tight leading-none ${labelSize}`}>{coverLabel}</span>
        </div>
      ) : (
        <div className="relative flex-1 flex flex-col justify-end">
          {category && (
            <span className="inline-block self-start px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-white/70 text-[10px] font-bold uppercase tracking-wider mb-3">
              {category}
            </span>
          )}
          <h3 className={`text-white font-extrabold leading-tight tracking-tight ${titleSize}`}>{title}</h3>
        </div>
      )}
    </div>
  );
}

function aspect(size: "card" | "feature" | "hero") {
  if (size === "hero") return "aspect-[16/9] rounded-2xl";
  if (size === "feature") return "aspect-[16/10] rounded-2xl";
  return "aspect-[16/10]";
}
