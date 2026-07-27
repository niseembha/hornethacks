"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import thirdLogo from "../../assets/third-logo.png";
import { event, links, visualSettings } from "../config";

type HeroStyle = React.CSSProperties & {
  "--mx": string;
  "--my": string;
  "--px": string;
  "--py": string;
  "--cursor-alpha": string;
};

type RevealStyle = React.CSSProperties & {
  "--reveal-order": number;
};

type IntroPhase = "intro" | "revealing" | "ready";

const revealStyle = (order: number): RevealStyle => ({
  "--reveal-order": order
});

function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand ${compact ? "brand--compact" : ""}`}>
      <svg
        className="brand__mark"
        viewBox="0 0 54 58"
        aria-hidden="true"
      >
        <path
          d="M27 2.7 49.2 15.8v26.4L27 55.3 4.8 42.2V15.8Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.4"
        />
        <path
          d="M18.2 28.5c3.7-8.5 12.2-10.9 18.3-5.5 5.4 4.7 3.1 14.4-4 19.4-6.4-1-11.1-5.7-14.3-13.9Z"
          fill="#a7c957"
          stroke="#071c12"
          strokeWidth="2.5"
        />
        <path
          d="m19.8 24.8-9.4-13.5c8.7 1.5 14.5 5 17.3 10.5Z"
          fill="#f2e8cf"
          stroke="#071c12"
          strokeWidth="2.5"
        />
        <path
          d="M21.7 32.5c4.7-.2 9.2 2.2 12 6.3M24.2 26c4.3-.4 8.6 1.6 11.5 5.1"
          fill="none"
          stroke="#386641"
          strokeWidth="3.2"
        />
        <path
          d="M36.8 21.8c.2-5.4 3.4-8.7 8.3-9.8"
          fill="none"
          stroke="#a7c957"
          strokeLinecap="round"
          strokeWidth="1.7"
        />
      </svg>
      <span className="brand__word">
        <b>HORNET</b>
        <b>HACKS</b>
      </span>
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="arrow"
    >
      <path d="M3.5 10h12M11 5.5l4.5 4.5-4.5 4.5" />
    </svg>
  );
}

function HexNetwork() {
  const hexes = [
    [86, 88],
    [164, 126],
    [244, 84],
    [332, 134],
    [418, 96],
    [512, 150],
    [602, 96],
    [124, 222],
    [214, 260],
    [314, 222],
    [424, 272],
    [544, 238],
    [646, 286],
    [86, 364],
    [194, 402],
    [308, 354],
    [436, 412],
    [574, 372],
    [684, 430],
    [130, 510],
    [272, 492],
    [408, 536],
    [552, 496]
  ];

  const links = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [1, 7],
    [7, 8],
    [8, 9],
    [9, 10],
    [10, 11],
    [11, 12],
    [7, 13],
    [13, 14],
    [14, 15],
    [15, 16],
    [16, 17],
    [17, 18],
    [14, 19],
    [19, 20],
    [20, 21],
    [21, 22]
  ];

  return (
    <svg className="network" viewBox="0 0 760 620" aria-hidden="true">
      <g className="network__dim">
        {links.map(([a, b]) => (
          <path
            key={`${a}-${b}`}
            d={`M${hexes[a][0]} ${hexes[a][1]} L${hexes[b][0]} ${hexes[b][1]}`}
          />
        ))}
        {hexes.map(([x, y], index) => (
          <circle key={index} cx={x} cy={y} r={index % 4 === 0 ? 4 : 2.5} />
        ))}
      </g>
      <g className="network__lit">
        {links.map(([a, b]) => (
          <path
            key={`${a}-${b}`}
            d={`M${hexes[a][0]} ${hexes[a][1]} L${hexes[b][0]} ${hexes[b][1]}`}
          />
        ))}
        {hexes.map(([x, y], index) => (
          <circle key={index} cx={x} cy={y} r={index % 4 === 0 ? 5 : 3} />
        ))}
      </g>
    </svg>
  );
}

function HornetIllustration() {
  return (
    <div className="mascot-stage" aria-hidden="false">
      <div className="mascot-orbit mascot-orbit--one" />
      <div className="mascot-orbit mascot-orbit--two" />
      <div className="mascot-readout mascot-readout--top">
        <span>FLIGHT_SYS</span>
        <strong>ONLINE</strong>
      </div>
      <div className="mascot-readout mascot-readout--bottom">
        <span>HIVE // 001</span>
        <strong>BUILD MODE</strong>
      </div>
      <svg
        className="hornet"
        viewBox="0 0 760 620"
        role="img"
        aria-label="A stylized futuristic hornet with glowing green wings flying through a digital hive"
      >
        <defs>
          <linearGradient id="wingFill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#f2e8cf" stopOpacity=".98" />
            <stop offset=".54" stopColor="#dcecb5" stopOpacity=".84" />
            <stop offset="1" stopColor="#6a994e" stopOpacity=".14" />
          </linearGradient>
          <linearGradient id="wingEdge" x1="0" x2="1">
            <stop stopColor="#f2e8cf" />
            <stop offset=".52" stopColor="#a7c957" />
            <stop offset="1" stopColor="#386641" />
          </linearGradient>
          <linearGradient id="bodyGreen" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#a7c957" />
            <stop offset=".48" stopColor="#6a994e" />
            <stop offset="1" stopColor="#274c32" />
          </linearGradient>
          <linearGradient id="headGreen" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#719e50" />
            <stop offset=".55" stopColor="#315b38" />
            <stop offset="1" stopColor="#102f1d" />
          </linearGradient>
          <radialGradient id="eyeGlow">
            <stop offset="0" stopColor="#f2ffb0" />
            <stop offset=".45" stopColor="#a7c957" />
            <stop offset="1" stopColor="#6a994e" />
          </radialGradient>
          <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="eyeBlur" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        <g className="hornet__shadow" opacity=".42">
          <ellipse cx="402" cy="469" rx="184" ry="42" fill="#020b07" />
        </g>

        <g className="hornet__float">
          <g className="wing wing--upper">
            <path
              d="M364 298C286 185 289 95 337 50c53 39 91 131 80 233Z"
              fill="url(#wingFill)"
              stroke="url(#wingEdge)"
              strokeWidth="5"
            />
            <path
              d="M366 277c-34-67-43-133-26-199M380 282c12-73-1-137-40-204"
              fill="none"
              stroke="#6a994e"
              strokeOpacity=".48"
              strokeWidth="2.5"
            />
            <path
              d="M391 287C434 154 511 90 573 99c1 73-61 160-158 208Z"
              fill="url(#wingFill)"
              stroke="url(#wingEdge)"
              strokeWidth="5"
            />
            <path
              d="M421 281c50-65 94-105 132-149M434 287c49-20 88-71 119-155"
              fill="none"
              stroke="#6a994e"
              strokeOpacity=".48"
              strokeWidth="2.5"
            />
          </g>

          <g className="wing wing--lower">
            <path
              d="M346 335c-93-42-166-30-194 14 46 48 128 63 217 27Z"
              fill="url(#wingFill)"
              stroke="url(#wingEdge)"
              strokeWidth="4"
            />
            <path
              d="M369 346c78-29 145-12 176 35-42 42-122 49-191 8Z"
              fill="url(#wingFill)"
              stroke="url(#wingEdge)"
              strokeWidth="4"
            />
          </g>

          <g className="hornet__legs" fill="none" strokeLinecap="round">
            <path d="m370 388-73 58-65 5M405 399l-18 77-52 35M433 390l65 59 63 4" />
            <path d="m294 446-20 23m111 7-13 30m127-57 21 23" />
          </g>

          <g className="hornet__body">
            <path
              d="M361 326c-52 10-115 52-177 117-16 17-3 45 20 40 92-19 162-53 200-100Z"
              fill="#193c26"
              stroke="#081c11"
              strokeWidth="7"
            />
            <path
              d="M184 443c-26 21-52 37-78 48 30 5 61 2 92-9Z"
              fill="#a7c957"
              stroke="#081c11"
              strokeLinejoin="round"
              strokeWidth="6"
            />
            <path
              d="M226 410c18 21 29 42 34 61 15-6 31-13 46-21-5-28-16-50-33-67Z"
              fill="#a7c957"
            />
            <path
              d="M293 370c19 18 34 39 43 63 16-10 31-20 43-31-9-28-24-49-44-62Z"
              fill="#a7c957"
            />
            <path
              d="M359 326c34-10 70 4 89 32 16 25 14 51-9 73-27 25-67 22-92-5-28-30-22-79 12-100Z"
              fill="url(#bodyGreen)"
              stroke="#081c11"
              strokeWidth="8"
            />
            <path
              d="M399 317c23-37 65-56 105-44 42 13 64 60 43 99-21 40-72 53-108 28-31-22-47-54-40-83Z"
              fill="url(#headGreen)"
              stroke="#081c11"
              strokeWidth="8"
            />
            <path
              d="M416 319c20-21 48-29 74-21-16 21-23 44-19 68-30 7-55-17-55-47Z"
              fill="#173621"
              opacity=".8"
            />
            <path
              d="M481 300c24 3 40 20 39 40-1 18-16 33-36 37-12-26-12-52-3-77Z"
              fill="url(#eyeGlow)"
              stroke="#071c12"
              strokeWidth="5"
            />
            <ellipse
              cx="494"
              cy="335"
              rx="11"
              ry="16"
              fill="#dfff86"
              filter="url(#eyeBlur)"
              opacity=".62"
            />
            <path
              d="m535 332 41 13-39 19"
              fill="#a7c957"
              stroke="#081c11"
              strokeLinejoin="round"
              strokeWidth="6"
            />
            <path
              d="M460 276c7-38 29-67 66-87M487 278c28-32 61-47 98-45"
              fill="none"
              stroke="#a7c957"
              strokeLinecap="round"
              strokeWidth="4"
            />
            <circle cx="527" cy="188" r="5" fill="#f2e8cf" filter="url(#softGlow)" />
            <circle cx="587" cy="233" r="5" fill="#f2e8cf" filter="url(#softGlow)" />
            <path
              d="M347 356c19 4 35 15 48 33"
              fill="none"
              stroke="#d6ef82"
              strokeLinecap="round"
              strokeWidth="6"
              opacity=".65"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

function ParticleField() {
  return (
    <div className="particles" aria-hidden="true">
      {Array.from({ length: visualSettings.particles }, (_, index) => (
        <i
          key={index}
          style={
            {
              "--x": `${(index * 47 + 11) % 97}%`,
              "--y": `${(index * 67 + 17) % 91}%`,
              "--delay": `${-(index % 8) * 0.7}s`,
              "--duration": `${5 + (index % 6) * 0.9}s`,
              "--size": `${2 + (index % 3) * 1.5}px`
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function TrophyIcon() {
  return (
    <svg className="prize-signal__icon" viewBox="0 0 28 28" aria-hidden="true">
      <path d="M9 4h10v5.5c0 3.5-2 6-5 6s-5-2.5-5-6V4Z" />
      <path d="M9 7H5v1.5c0 3 2.1 4.5 5.2 4.5M19 7h4v1.5c0 3-2.1 4.5-5.2 4.5M14 15.5V21M9.5 24h9M11 21h6" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg className="map-pin" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 18s6-5.4 6-10a6 6 0 1 0-12 0c0 4.6 6 10 6 10Z" />
      <circle cx="10" cy="8" r="2" />
    </svg>
  );
}

function SponsorIcon() {
  return (
    <svg className="sponsor-icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 17.2 3.4 10.8A4.7 4.7 0 0 1 10 4.1a4.7 4.7 0 0 1 6.6 6.7Z" />
      <path d="M10 4.1v13.1" />
    </svg>
  );
}

const introFlights = [
  { x: "-44vw", y: "-36vh", r: "-26deg", s: 0.9, d: "0.8s", dir: -1 },
  { x: "-49vw", y: "7vh", r: "8deg", s: 0.7, d: "0.95s", dir: -1 },
  { x: "-34vw", y: "41vh", r: "30deg", s: 0.8, d: "1.12s", dir: -1 },
  { x: "40vw", y: "-41vh", r: "-18deg", s: 0.82, d: "0.87s", dir: 1 },
  { x: "51vw", y: "-5vh", r: "-5deg", s: 1.02, d: "1.02s", dir: 1 },
  { x: "43vw", y: "36vh", r: "26deg", s: 0.76, d: "1.18s", dir: 1 },
  { x: "-11vw", y: "-52vh", r: "-78deg", s: 0.62, d: "1.24s", dir: -1 },
  { x: "13vw", y: "50vh", r: "77deg", s: 0.66, d: "1.34s", dir: 1 },
  { x: "-53vw", y: "-12vh", r: "-4deg", s: 0.52, d: "1.42s", dir: -1 },
  { x: "53vw", y: "14vh", r: "8deg", s: 0.58, d: "1.5s", dir: 1 }
] as const;

function LaunchHornet({
  style
}: {
  style: React.CSSProperties;
}) {
  return (
    <svg className="launch-hornet" viewBox="0 0 66 42" style={style}>
      <g className="launch-hornet__flyer">
        <path
          className="launch-hornet__wing launch-hornet__wing--top"
          d="M29 20C18 7 15 3 10 4c-2 8 4 16 17 22Z"
        />
        <path
          className="launch-hornet__wing launch-hornet__wing--bottom"
          d="M30 23C16 20 8 23 7 29c7 6 17 5 26-1Z"
        />
        <path
          className="launch-hornet__abdomen"
          d="M7 24c5-8 14-10 25-6l8 8c-10 10-24 12-33 5l-5-3Z"
        />
        <path className="launch-hornet__stripe" d="M17 18.5c3.4 4.7 4.7 9.9 3.8 15" />
        <path className="launch-hornet__stripe" d="M26 18.2c3.2 4 4.8 8.2 4.7 12.7" />
        <ellipse className="launch-hornet__thorax" cx="39" cy="24" rx="9" ry="9.5" />
        <circle className="launch-hornet__head" cx="50" cy="22" r="7.5" />
        <circle className="launch-hornet__eye" cx="53" cy="20" r="2.3" />
        <path className="launch-hornet__stinger" d="m7 24-6 4 7 2Z" />
        <path className="launch-hornet__antenna" d="M53 16c3-5 7-7 11-7M56 18c5-2 8-2 10 0" />
      </g>
    </svg>
  );
}

function HiveIntro({
  phase,
  onSkip
}: {
  phase: Exclude<IntroPhase, "ready">;
  onSkip: () => void;
}) {
  return (
    <div className={`hive-intro hive-intro--${phase}`}>
      <button type="button" className="hive-intro__skip" onClick={onSkip}>
        SKIP INTRO
      </button>

      <div className="hive-intro__status" aria-hidden="true">
        <span>HIVE PROTOCOL // 001</span>
        <b>{phase === "intro" ? "ASSEMBLING THE HIVE" : "FLIGHT DECK ONLINE"}</b>
      </div>

      <div className="hive-intro__reticle" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => <i key={index} />)}
      </div>

      <div className="hive-intro__beams" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <i
            key={index}
            style={{ "--beam-angle": `${index * 60}deg` } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="hive-intro__sparks" aria-hidden="true">
        {Array.from({ length: 16 }, (_, index) => (
          <i
            key={index}
            style={
              {
                "--spark-angle": `${index * 22.5}deg`,
                "--spark-distance": `${155 + (index % 4) * 34}px`,
                "--spark-delay": `${0.72 + (index % 6) * 0.08}s`
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="hive-intro__portal" aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => (
          <i
            key={index}
            style={
              {
                "--ring-size": `${112 + index * 44}px`,
                "--ring-delay": `${index * 0.07}s`
              } as React.CSSProperties
            }
          />
        ))}
        <div className="hive-intro__core">
          <LogoMark compact />
        </div>
      </div>

      <div className="hive-intro__flight" aria-hidden="true">
        {introFlights.map((flight, index) => (
          <LaunchHornet
            key={index}
            style={
              {
                "--flight-x": flight.x,
                "--flight-y": flight.y,
                "--flight-r": flight.r,
                "--flight-s": flight.s,
                "--flight-delay": flight.d,
                "--flight-dir": flight.dir
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="hive-intro__aperture" aria-hidden="true" />
    </div>
  );
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const [introPhase, setIntroPhase] = useState<IntroPhase>("intro");

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      const reducedTimer = window.setTimeout(() => setIntroPhase("ready"), 0);
      return () => window.clearTimeout(reducedTimer);
    }

    if (introPhase === "ready") return;

    const introTimer = window.setTimeout(
      () =>
        setIntroPhase((current) =>
          current === "intro" ? "revealing" : "ready"
        ),
      introPhase === "intro" ? 2100 : 1750
    );
    return () => window.clearTimeout(introTimer);
  }, [introPhase]);

  useEffect(() => {
    const hero = heroRef.current;
    if (
      !hero ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    const updatePointer = (event: PointerEvent) => {
      if (frameRef.current) return;
      frameRef.current = window.requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
        const px = x / rect.width - 0.5;
        const py = y / rect.height - 0.5;

        hero.style.setProperty("--mx", `${x}px`);
        hero.style.setProperty("--my", `${y}px`);
        hero.style.setProperty("--px", px.toFixed(3));
        hero.style.setProperty("--py", py.toFixed(3));
        hero.style.setProperty("--cursor-alpha", "1");
        frameRef.current = null;
      });
    };

    const resetPointer = () => {
      hero.style.setProperty("--px", "0");
      hero.style.setProperty("--py", "0");
      hero.style.setProperty("--cursor-alpha", "0");
    };

    hero.addEventListener("pointermove", updatePointer, { passive: true });
    hero.addEventListener("pointerleave", resetPointer);

    return () => {
      hero.removeEventListener("pointermove", updatePointer);
      hero.removeEventListener("pointerleave", resetPointer);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const initialStyle: HeroStyle = {
    "--mx": "72vw",
    "--my": "42vh",
    "--px": "0",
    "--py": "0",
    "--cursor-alpha": "0"
  };

  return (
    <main>
      <section
        className={`hero hero--${introPhase}`}
        ref={heroRef}
        style={initialStyle}
        aria-labelledby="hero-title"
      >
        {introPhase !== "ready" && (
          <HiveIntro
            phase={introPhase}
            onSkip={() => setIntroPhase("revealing")}
          />
        )}

        <a className="skip-link" href="#hero-content">
          Skip to main content
        </a>

        <div className="hero__atmosphere" aria-hidden="true" />
        <div className="hero__cursor-glow" aria-hidden="true" />
        <div className="hero__hex-grid" aria-hidden="true" />
        <HexNetwork />
        <ParticleField />

        <header
          className="site-header hero-reveal hero-reveal--header"
          style={revealStyle(0)}
        >
          <a className="logo-link" href="#" aria-label="HornetHacks home">
            <span className="header-brand">
              <span className="header-brand__asset" aria-hidden="true">
                <Image
                  className="header-brand__image"
                  src={thirdLogo}
                  alt=""
                  priority
                  sizes="192px"
                />
              </span>
              <span className="brand__word">
                <b>HORNET</b>
                <b>HACKS</b>
              </span>
            </span>
          </a>

          <div className="header-status">
            <span>THE HIVE IS FORMING</span>
            <i aria-hidden="true" />
            <b>FULL EVENT DETAILS COMING SOON</b>
          </div>

          <div className="header-actions">
            <a
              className="sponsor-cta"
              href={links.sponsorForm}
              target="_blank"
              rel="noreferrer"
            >
              SPONSOR / SUPPORT
            </a>
            <a
              className="nav-cta"
              href={links.interestForm}
              target="_blank"
              rel="noreferrer"
            >
              INTEREST FORM <ArrowIcon />
            </a>
          </div>
        </header>

        <div className="hero__layout" id="hero-content">
          <div className="hero__copy">
            <div className="eyebrow hero-reveal" style={revealStyle(1)}>
              <span className="eyebrow__pulse" />
              {event.eyebrow}
            </div>

            <h1 id="hero-title">
              <span className="hero-reveal" style={revealStyle(2)}>
                {event.headline[0]}
              </span>
              <span className="hero-reveal" style={revealStyle(3)}>
                {event.headline[1]}
              </span>
              <span className="hero-reveal" style={revealStyle(4)}>
                <em>BUZZING</em> ABOUT.
              </span>
            </h1>

            <p className="hero__description hero-reveal" style={revealStyle(5)}>
              {event.description}
            </p>

            <aside
              className="prize-signal hero-reveal"
              id="prizes"
              aria-label="Prize announcement"
              style={revealStyle(6)}
            >
              <div className="prize-signal__badge" aria-hidden="true">
                <TrophyIcon />
                <span>PRIZES</span>
              </div>
              <div className="prize-signal__copy">
                <span>REWARDS // ANNOUNCEMENT PENDING</span>
                <strong>
                  PRIZE REVEAL <em>INCOMING</em>
                </strong>
                <p>
                  Prize tracks and rewards are being finalized. Join the form
                  to get the reveal first.
                </p>
              </div>
              <a
                className="prize-signal__cta"
                href={links.interestForm}
                target="_blank"
                rel="noreferrer"
              >
                <span>GET THE REVEAL</span>
                <ArrowIcon />
              </a>
            </aside>

            <dl
              className="event-meta hero-reveal"
              aria-label="Event details"
              style={revealStyle(7)}
            >
              {event.details.map((detail) => (
                <div key={detail.label}>
                  <dt>{detail.label}</dt>
                  <dd>
                    {"href" in detail ? (
                      <a href={detail.href} target="_blank" rel="noreferrer">
                        <MapPinIcon />
                        {detail.value}
                      </a>
                    ) : (
                      detail.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <div
              className="hero__actions hero-reveal"
              id="interest-form"
              style={revealStyle(8)}
            >
              <a
                className="button button--primary"
                href={links.interestForm}
                target="_blank"
                rel="noreferrer"
              >
                <span>JOIN THE INTEREST FORM</span>
                <ArrowIcon />
              </a>
              <a
                className="button button--sponsor"
                href={links.sponsorForm}
                target="_blank"
                rel="noreferrer"
              >
                <SponsorIcon />
                <span>SPONSOR OR SUPPORT US</span>
                <ArrowIcon />
              </a>
            </div>

            <div
              className="reassurance hero-reveal"
              aria-label="What is included"
              style={revealStyle(9)}
            >
              {event.reassurance.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          <div className="hero__visual">
            <div
              className="hero__visual-reveal hero-reveal hero-reveal--visual"
              style={revealStyle(3)}
            >
              <div className="visual-kicker visual-kicker--left">
                <span>24H</span>
                <b>NO SLEEP.<br />JUST SHIP.</b>
              </div>
              <HornetIllustration />
              <a
                className="visual-location"
                href={links.venue}
                target="_blank"
                rel="noreferrer"
                aria-label={`${event.venue}, ${event.address} — open in Google Maps`}
              >
                <MapPinIcon />
                <span>VENUE CONFIRMED</span>
                <b>GREENHILL SCHOOL</b>
              </a>
            </div>
          </div>
        </div>

        <div
          className="hero__edge hero-reveal"
          style={revealStyle(10)}
          aria-hidden="true"
        >
          <i />
          <span>hornethacks.com</span>
        </div>
      </section>
    </main>
  );
}
