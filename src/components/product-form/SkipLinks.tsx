import { cn } from "@/lib/utils";

interface SkipLink {
  href: string;
  label: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

const DEFAULT_LINKS: SkipLink[] = [
  { href: "#basic-info", label: "Temel Bilgilere Git" },
  { href: "#categories", label: "Kategorilere Git" },
  { href: "#features", label: "Özelliklere Git" },
  { href: "#media", label: "Medyaya Git" },
  { href: "#links", label: "Bağlantılara Git" },
  { href: "#form-actions", label: "Kaydet Butonuna Git" },
];

export function SkipLinks({ links = DEFAULT_LINKS, className }: SkipLinksProps) {
  return (
    <nav
      aria-label="Hizli erisim baglantilari"
      className={cn("sr-only focus-within:not-sr-only", className)}
    >
      <ul className="fixed top-0 left-0 z-50 p-4 bg-background border-b border-border shadow-lg space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className={cn(
                "block px-4 py-2 text-sm font-medium rounded-md",
                "bg-primary text-primary-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "hover:bg-primary/90 transition-colors"
              )}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Inline skip link for specific sections
export function SkipToSection({
  targetId,
  label,
  className,
}: {
  targetId: string;
  label: string;
  className?: string;
}) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        "sr-only focus:not-sr-only",
        "absolute left-4 top-4 z-50",
        "px-4 py-2 text-sm font-medium rounded-md",
        "bg-primary text-primary-foreground",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
    >
      {label}
    </a>
  );
}

export default SkipLinks;
