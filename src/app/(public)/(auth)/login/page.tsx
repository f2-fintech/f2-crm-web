import type { Metadata } from "next";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Login | F2 CRM",
  description:
    "Secure login to the F2 CRM Portal for managing leads, customers, applications, and team operations.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <SignInForm />;
}