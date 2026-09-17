"use client";

import {
  MessageCircle,
  Users,
  ContactRound,
} from "lucide-react";
import clsx from "clsx";

const menus = [
  {
    id: 1,
    title: "Chats",
    icon: MessageCircle,
    active: true,
  },
  {
    id: 2,
    title: "Channels",
    icon: Users,
    active: false,
  },
  {
    id: 3,
    title: "Contacts",
    icon: ContactRound,
    active: false,
  },
];

const FooterMenu = () => {
  return (
    <div className="flex h-full">
      {menus.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            className={clsx(
              "flex h-full w-24 flex-col items-center justify-center border-r border-gray-200 transition-all duration-200",
              item.active
                ? "bg-gray-100 text-indigo-600"
                : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
            )}
          >
            <Icon size={18} strokeWidth={2} />

            <span className="mt-1 text-[11px] font-medium">
              {item.title}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default FooterMenu;