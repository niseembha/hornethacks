"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { href: "/#about", label: "About" },
  { href: "/#schedule", label: "Schedule" },
  { href: "/#resources", label: "Resources" },
  { href: "/#rules", label: "Rules" },
  { href: "/#faq", label: "FAQ" }
];

export function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link className={`brand ${footer ? "brandFooter" : ""}`} href="/" aria-label="Hornet Hacks home">
      <span className="brandIcon" aria-hidden="true">
        <Image
          src="/assets/hornet-mascot.png"
          alt=""
          width={58}
          height={58}
          priority={!footer}
        />
      </span>
      <span className="brandWords">
        <span>Hornet</span>
        <strong>Hacks</strong>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const focusable = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".siteHeader a[href], .siteHeader button:not([disabled])"
      )
    ).filter((element) => {
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden";
    });
    const first = focusable[0];
    const last = focusable.at(-1);
    mobileNavRef.current?.querySelector<HTMLElement>("a[href]")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }

      if (event.key !== "Tab" || !first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    document.body.classList.toggle("menuOpen", open);
    return () => document.body.classList.remove("menuOpen");
  }, [open]);

  useEffect(() => {
    const background = [
      document.querySelector<HTMLElement>(".skipLink"),
      document.querySelector<HTMLElement>(".announcement"),
      document.querySelector<HTMLElement>("main"),
      document.querySelector<HTMLElement>(".siteFooter")
    ].filter((element): element is HTMLElement => Boolean(element));

    background.forEach((element) => {
      element.inert = open;
    });

    return () => {
      background.forEach((element) => {
        element.inert = false;
      });
    };
  }, [open]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 901px)");
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeAtDesktop);
    return () => desktop.removeEventListener("change", closeAtDesktop);
  }, []);

  return (
    <header className="siteHeader">
      <div className="navShell">
        <Brand />

        <nav className="desktopNav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="headerActions">
          <Link className="loginLink" href="/login">
            Log in preview
          </Link>
          <Link className="button buttonSmall buttonPrimary headerRegister" href="/register">
            Register soon
          </Link>
          <button
            className="menuButton"
            type="button"
            ref={menuButtonRef}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div
        className={`mobileNav ${open ? "mobileNavOpen" : ""}`}
        id="mobile-navigation"
        ref={mobileNavRef}
        aria-hidden={!open}
      >
        <nav aria-label="Mobile navigation">
          {navItems.map((item, index) => (
            <Link href={item.href} key={item.href} onClick={() => setOpen(false)}>
              <span>0{index + 1}</span>
              {item.label}
            </Link>
          ))}
          <div className="mobileNavActions">
            <Link className="button buttonGhostDark" href="/login" onClick={() => setOpen(false)}>
              Log in preview
            </Link>
            <Link className="button buttonPrimary" href="/register" onClick={() => setOpen(false)}>
              Registration preview
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
