import { siteConfig } from "../site-config";

export function Footer() {
  const { footer, brand } = siteConfig;

  return (
    <footer className="py-12 border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Brand mark */}
            <div className="flex items-center gap-2">
              <span className="text-green font-mono text-sm">❯</span>
              <span className="font-mono text-sm font-bold text-white">
                {brand.name}
              </span>
            </div>
            <span className="font-mono text-xs text-dim">
              {footer.tagline}
            </span>
          </div>

          <div className="flex items-center gap-6">
            {footer.links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                className="font-mono text-xs text-dim hover:text-muted transition-colors"
              >
                {link.label}
              </a>
            ))}
            <span className="font-mono text-xs text-dim">
              {footer.copyright}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
