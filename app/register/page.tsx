import type { Metadata } from "next";

import PortalForm from "@/components/PortalForm";

export const metadata: Metadata = {
  title: "Registration preview",
  description:
    "Preview registration for Hornet Hacks, a hackathon built for high-school students.",
};

export default function RegisterPage() {
  return <PortalForm mode="register" />;
}
