import type { SVGProps } from "react";

export type IconName =
  | "arrow"
  | "calendar"
  | "check"
  | "clock"
  | "code"
  | "discord"
  | "external"
  | "flag"
  | "github"
  | "graduation"
  | "instagram"
  | "lightbulb"
  | "mail"
  | "map"
  | "palette"
  | "presentation"
  | "rocket"
  | "scale"
  | "shield"
  | "spark"
  | "ticket"
  | "users";

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
};

export function Icon({ name, size = 22, ...props }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true
  };

  const paths: Record<IconName, React.ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    code: (
      <>
        <path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14" />
      </>
    ),
    discord: (
      <>
        <path d="M8.5 8.5a11 11 0 0 1 7 0M9 16l-1.5 2M15 16l1.5 2" />
        <path d="M7 6.5c-2 3-2.5 6.5-2 9.5 2 1.5 4 2 7 2s5-.5 7-2c.5-3 0-6.5-2-9.5-1.3-.7-2.3-1-3.5-1.2l-.7 1.2h-1.6l-.7-1.2A9 9 0 0 0 7 6.5Z" />
        <circle cx="9" cy="12.5" r=".8" fill="currentColor" stroke="none" />
        <circle cx="15" cy="12.5" r=".8" fill="currentColor" stroke="none" />
      </>
    ),
    external: (
      <>
        <path d="M14 5h5v5M19 5l-8 8" />
        <path d="M17 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5" />
      </>
    ),
    flag: (
      <>
        <path d="M5 21V4" />
        <path d="M5 5h11l-2 3 2 3H5" />
      </>
    ),
    github: (
      <>
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.5 5.5 0 0 0 19.3 4 5 5 0 0 0 19.1.5S17.9.1 15 2a13.4 13.4 0 0 0-6 0C6.1.1 4.9.5 4.9.5A5 5 0 0 0 4.7 4a5.5 5.5 0 0 0-1.5 3.8c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 9 18v4" />
        <path d="M9 19c-3 .9-3-1.5-4.2-2" />
      </>
    ),
    graduation: (
      <>
        <path d="m3 10 9-5 9 5-9 5-9-5Z" />
        <path d="M7 12.5V17c3 2 7 2 10 0v-4.5M21 10v6" />
      </>
    ),
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r=".7" fill="currentColor" stroke="none" />
      </>
    ),
    lightbulb: (
      <>
        <path d="M9 18h6M10 22h4" />
        <path d="M8.5 15.5A6 6 0 1 1 15.5 15.5c-.8.7-1.5 1.2-1.5 2.5h-4c0-1.3-.7-1.8-1.5-2.5Z" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    map: (
      <>
        <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
        <path d="M9 3v15M15 6v15" />
      </>
    ),
    palette: (
      <>
        <path d="M12 3a9 9 0 0 0 0 18h1.2a1.8 1.8 0 0 0 1.3-3c-.8-.8-.2-2 1-2H18a3 3 0 0 0 3-3 10 10 0 0 0-9-10Z" />
        <circle cx="7.5" cy="10" r=".8" fill="currentColor" stroke="none" />
        <circle cx="10" cy="6.8" r=".8" fill="currentColor" stroke="none" />
        <circle cx="14" cy="6.8" r=".8" fill="currentColor" stroke="none" />
      </>
    ),
    presentation: (
      <>
        <path d="M4 4h16v12H4zM8 20l4-4 4 4" />
        <path d="M9 12l2-2 2 1 3-3" />
      </>
    ),
    rocket: (
      <>
        <path d="M14 5c3.5-3.5 6-2 6-2s1.5 2.5-2 6l-4 4-5-4 5-4Z" />
        <path d="m9 9-4 1-2 3 6 1M14 14l-1 5-3 2-1-7" />
        <path d="M7 17c-2 0-3 1-3 3 2 0 3-1 3-3Z" />
      </>
    ),
    scale: (
      <>
        <path d="M12 3v18M5 6h14M7 6l-4 7h8L7 6ZM17 6l-4 7h8l-4-7ZM8 21h8" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 4.5 6v5.5c0 4.7 3 7.7 7.5 9.5 4.5-1.8 7.5-4.8 7.5-9.5V6L12 3Z" />
        <path d="m9 12 2 2 4-5" />
      </>
    ),
    spark: (
      <>
        <path d="m12 2 1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2Z" />
        <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
      </>
    ),
    ticket: (
      <>
        <path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 0 0-4V4H3v4Z" />
        <path d="M14 4v12" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M16 11a3 3 0 0 0 0-6M16 14c2.8 0 5 2.2 5 5" />
      </>
    )
  };

  return (
    <svg {...common} {...props}>
      {paths[name]}
    </svg>
  );
}
