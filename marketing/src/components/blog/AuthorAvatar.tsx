"use client";

import { useState } from "react";

// Shows the author photo; falls back to a monogram if the image is missing
// (e.g. before the photo has been uploaded to the CDN).
export default function AuthorAvatar({
  src,
  name,
  className = "",
}: {
  src?: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <span className={`bg-[#0e1b2f] text-white flex items-center justify-center font-bold ${className}`}>
      {name.charAt(0)}
    </span>
  );
}
