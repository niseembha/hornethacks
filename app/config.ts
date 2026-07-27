export const event = {
  name: "HornetHacks",
  eyebrow: "TEXAS’ STUDENT-POWERED HACKATHON",
  headline: ["BUILD SOMETHING", "WORTH", "BUZZING ABOUT."],
  description:
    "A free, 24-hour build experience for high-school creators, engineers, designers, and first-time hackers across Texas.",
  details: [
    { label: "DURATION", value: "24 HOURS" },
    {
      label: "LOCATION",
      value: "GREENHILL SCHOOL",
      href:
        "https://www.google.com/maps/search/?api=1&query=4141+Spring+Valley+Rd%2C+Addison%2C+TX+75001"
    }
  ],
  reassurance: ["Beginner-friendly", "Teams of up to 4", "Food provided"],
  venue: "Greenhill School",
  address: "4141 Spring Valley Rd, Addison, TX 75001"
} as const;

export const links = {
  interestForm:
    "https://docs.google.com/forms/d/e/1FAIpQLScz1JnC0V4NKa8stIY0xFbykrKmdSfTW-2wFKcHOf87x72zZQ/viewform",
  venue:
    "https://www.google.com/maps/search/?api=1&query=4141+Spring+Valley+Rd%2C+Addison%2C+TX+75001",
  sponsorForm:
    "https://docs.google.com/forms/d/e/1FAIpQLSfzFWzO4GqL3_tIzzkfWJIZ-k4ku_u5ucetyT1_wBfusdug1g/viewform"
} as const;

export const visualSettings = {
  maxParallax: 18,
  particles: 18
} as const;
