import type { Metadata } from "next";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create Account | F2 CRM",
  description:
    "Create a new account for the F2 CRM Portal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignUpPage() {
  return <SignUpForm />;
}