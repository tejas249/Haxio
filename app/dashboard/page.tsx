import type { Metadata } from "next";
import DashboardClient from "@/components/DashboardClient";

export const metadata: Metadata = {
  title: "Support Dashboard",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
