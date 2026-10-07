"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Wordmark, PageHeader } from "@/components/ui";
import { useLocale } from "@/lib/locale-context";
import { tx } from "@/lib/i18n";

const NAV = [
  { href: "/assistant", label: "Check product" },
  { href: "/standards", label: "Standards" },
  { href: "/labs", label: "Labs" },
  { href: "/consumer", label: "Verify & complain" },
  { href: "/certification", label: "Certification guide" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function Nav() {
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /* close the mobile menu after navigating (derived during render, no effect) */
  if (open && openedAt !== pathname) {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header data-site-header className="sticky top-0 z-40 border-b border-rule bg-canvas">
      <div className="mx-auto flex h-[var(--header-h)] max-w-[1240px] items-center justify-between gap-6 px-5 sm:px-8">
        <Wordmark />
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {NAV.map((n) => {
              const active = isActive(pathname, n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {tx(locale, n.label)}
                    {active && (
                      <span aria-hidden="true" className="absolute inset-x-3 -bottom-[13px] h-[2px] bg-select" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <button
          type="button"
          onClick={() => setLocale(locale === "en" ? "hi" : "en")}
          aria-label={tx(locale, "Switch language")}
          className="btn btn-secondary btn-sm shrink-0"
        >
          {locale === "en" ? "हिन्दी" : "English"}
        </button>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => {
            setOpenedAt(pathname);
            setOpen((o) => !o);
          }}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="btn btn-quiet -mr-2 lg:hidden"
        >
          {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          <span className="text-sm">{tx(locale, "Menu")}</span>
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Primary" className="border-t border-rule bg-canvas lg:hidden">
          <ul className="mx-auto max-w-[1240px] px-3 py-2 sm:px-6">
            {NAV.map((n) => {
              const active = isActive(pathname, n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between rounded-md px-3 py-3 text-base ${
                      active ? "bg-select-soft font-semibold text-select-ink" : "text-ink"
                    }`}
                  >
                    {tx(locale, n.label)}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mx-auto max-w-[1240px] px-3 pb-3 sm:px-6">
            <button
              type="button"
              onClick={() => setLocale(locale === "en" ? "hi" : "en")}
              aria-label={tx(locale, "Switch language")}
              className="btn btn-secondary btn-sm"
            >
              {locale === "en" ? "हिन्दी" : "English"}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  const { locale } = useLocale();
  return (
    <footer data-site-footer className="border-t border-rule bg-sunken">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-2 px-5 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>Pramaan · {tx(locale, "Indian standards and certification guidance")}</p>
        <p>
          <Link href="/certification" className="link font-normal">{tx(locale, "Certification guide")}</Link>
          {" · "}<Link href="/dashboard" className="link font-normal">{tx(locale, "Insights")}</Link>
          {" · "}{tx(locale, "Demo data; confirm legal positions with BIS.")}
        </p>
      </div>
    </footer>
  );
}

/** Standard frame for inner pages: header with title, then content. */
export function PageShell({
  title,
  description,
  aside,
  children,
}: {
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main id="main">
      <PageHeader title={title} description={description} aside={aside} />
      <div className="mx-auto max-w-[1240px] px-5 pt-8 sm:px-8">{children}</div>
    </main>
  );
}
