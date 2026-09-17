"use client";

import { useEffect, useState } from "react";
import { ROLES } from "../config/roles";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  [key: string]: any;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Failed to parse user from local storage", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const role = user?.role?.toUpperCase() || "";

  return {
    user,
    role,
    isLoading,
    isSuperAdmin: role === ROLES.SUPER_ADMIN,
    isAdmin: role === ROLES.ADMIN,
    isManager: role === ROLES.MANAGER,
    isTeamLeader: role === ROLES.TEAM_LEADER,
    isEmployee: role === ROLES.EMPLOYEE,
  };
};
