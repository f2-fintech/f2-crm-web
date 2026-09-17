import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "F2 CRM Dashboard",
  description: "F2 Fintech CRM Dashboard",
};

export default function DashboardPage() {
  return <DashboardClient />;
}