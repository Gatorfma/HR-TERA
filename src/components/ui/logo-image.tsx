import { useState } from "react";
import { cn } from "@/lib/utils";

interface LogoImageProps {
  src?: string;
  alt: string;
  variant: "card" | "icon";
  /** Override container size for icon variant (e.g. "w-12 h-12") */
  sizeClassName?: string;
  className?: string;
  /** Enable scale-up on group-hover (card variant) */
  hoverZoom?: boolean;
  /** Border-radius class override (default: rounded-lg for icon) */
  rounded?: string;
  /** Text used for the fallback letter (defaults to alt) */
  fallbackText?: string;
}

const LogoImage = ({
  src,
  alt,
  variant,
  sizeClassName,
  className,
  hoverZoom = false,
  rounded,
  fallbackText,
}: LogoImageProps) => {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  const letter = (fallbackText || alt || "?").charAt(0).toUpperCase();

  if (variant === "card") {
    return (
      <div
        className={cn(
          "aspect-[3/2] flex items-center justify-center bg-white dark:bg-card border-b border-border overflow-hidden",
          className,
        )}
      >
        {showFallback ? (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <span className="text-4xl font-bold text-primary/40">{letter}</span>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            onError={() => setFailed(true)}
            className={cn(
              "max-w-full max-h-full object-contain p-6",
              hoverZoom && "transition-transform duration-500 group-hover:scale-105",
            )}
          />
        )}
      </div>
    );
  }

  // icon variant
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-white dark:bg-card border border-border overflow-hidden flex-shrink-0",
        rounded || "rounded-lg",
        sizeClassName || "w-12 h-12",
        className,
      )}
    >
      {showFallback ? (
        <span className="text-sm font-bold text-primary/60">{letter}</span>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="max-w-full max-h-full object-contain p-1"
        />
      )}
    </div>
  );
};

export default LogoImage;
