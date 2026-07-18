import type { Metadata } from "next";

import PortalForm from "@/components/PortalForm";

export const metadata: Metadata = {
  title: "Account access preview",
  description:
    "Preview the Hornet Hacks participant portal. Authentication is coming soon.",
};

export default function LoginPage() {
  return <PortalForm mode="login" />;
}
