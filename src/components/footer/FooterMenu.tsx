"use client";

import {
  MessageCircle,
  Users,
  ContactRound,
} from "lucide-react";
import clsx from "clsx";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  {
    id: 1,
    title: "Chats",
    icon: MessageCircle,
    path: "/chat",
  },
  {
    id: 2,
    title: "Channels",
    icon: Users,
    path: "/channels",
  },
  {
    id: 3,
    title: "Contacts",
    icon: ContactRound,
    path: "/contacts",
  },
];

const FooterMenu = () => {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      {menus.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;

        return (
          <Link
            key={item.id}
            href={item.path}
            className={clsx(
              "flex h-full w-24 flex-col items-center justify-center border-r border-gray-200 transition-all duration-200",
              isActive
                ? "bg-gray-100 text-indigo-600"
                : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
            )}
          >
            <Icon size={18} strokeWidth={2} />

            <span className="mt-1 text-[11px] font-medium">
              {item.title}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default FooterMenu;