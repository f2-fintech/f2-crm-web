"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../config/roles";

interface RoleGuardProps {
  children: React.ReactNode;
}

export default function RoleGuard({ children }: RoleGuardProps) {
  const { role, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // If not logged in, wait for middleware or handle redirect here
    if (!user) {
      router.push("/login");
      return;
    }

    if (hasPermission(pathname, role)) {
      setAuthorized(true);
    } else {
      // Redirect unauthorized users to dashboard
      router.replace("/");
    }
  }, [isLoading, role, pathname, user, router]);

  if (isLoading || !authorized) {
    // You can replace this with a better loading skeleton or spinner
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
