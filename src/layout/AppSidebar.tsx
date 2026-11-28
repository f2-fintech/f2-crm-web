"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../hooks/useAuth";
import { hasPermission } from "../config/roles";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GroupIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";
import { MessageSquare, Contact, Sparkles, Calculator, Stethoscope, FolderGit2, Search, PhoneCall } from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <PhoneCall size={18} />,
    name: "Dialer Call Logs",
    path: "/dialer",
  },
  {
    icon: <GroupIcon />,
    name: "Teams",
    path: "/teams",
  },
  {
    icon: <Calculator size={18} />,
    name: "EMI Calculator",
    path: "/emi-calculator",
  },
  {
    icon: <GroupIcon />,
    name: "CRM",
    subItems: [
      { name: "Notion Workspace", path: "/notion-pages", new: true },
      { name: "Notion Remarks", path: "/notion-remarks", pro: true },
    ],
  },
  {
    icon: <ListIcon />,
    name: "Workqueue",
    path: "/workqueue",
  },
  {
    icon: <TableIcon />,
    name: "Reports",
    path: "/reports",
  },
  {
    icon: <PieChartIcon />,
    name: "Analytics",
    path: "/analytics",
  },
  {
    icon: <CalenderIcon />,
    name: "My Requests",
    path: "/my-requests",
  },
  {
    icon: <Sparkles size={18} />,
    name: "AI Copilot",
    path: "/ai-assistant",
  },
  {
    icon: <Stethoscope size={18} />,
    name: "Doctor Network",
    path: "/doctors",
  },
  {
    icon: <UserCircleIcon />,
    name: "Agents",
    path: "/agents",
  },
];

const othersItems: NavItem[] = [
  {
    icon: <Sparkles size={18} />,
    name: "Lead Scoring",
    path: "/lead-scoring",
  },
  {
    icon: <FolderGit2 size={18} />,
    name: "Drive Allocation",
    path: "/drive-allocation",
  },
  {
    icon: <Search size={18} />,
    name: "MIS Search Book",
    path: "/mis-search",
  },
  {
    icon: <BoxCubeIcon />,
    name: "Administration",
    subItems: [
      { name: "Users", path: "/users" },
      { name: "Roles", path: "/roles" },
      { name: "Permissions", path: "/permissions" },
      { name: "Departments", path: "/departments" },
      { name: "Branches", path: "/branches" },
      { name: "Teams", path: "/teams" },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Integrations",
    path: "/integrations",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();
  const { role, isLoading } = useAuth();

  const handleLinkClick = () => {
    if (isMobileOpen) toggleMobileSidebar();
  };

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const showLabels = isExpanded || isHovered || isMobileOpen;

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => {
    const visibleItems = navItems.filter((nav) => {
      if (nav.path && !hasPermission(nav.path, role)) return false;
      return true;
    });

    return (
      <ul className="flex flex-col gap-1">
        {visibleItems.map((nav, index) => {
          const groupOpen =
            openSubmenu?.type === menuType && openSubmenu?.index === index;

          return (
            <li key={nav.name} className="relative">
              {nav.subItems ? (
                <button
                  id={`sidebar-item-${nav.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={`group relative flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-all duration-150 ${
                    groupOpen
                      ? "bg-slate-800/60 text-white ring-1 ring-slate-700/60 shadow-sm"
                      : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                  } ${!showLabels ? "lg:justify-center" : "justify-start"}`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center transition-colors duration-150 ${
                      groupOpen
                        ? "text-indigo-400"
                        : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {showLabels && <span className="truncate">{nav.name}</span>}
                  {showLabels && (
                    <ChevronDownIcon
                      className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${
                        groupOpen ? "rotate-180 text-indigo-400" : "text-slate-500 group-hover:text-slate-400"
                      }`}
                    />
                  )}
                </button>
              ) : (
                nav.path && (
                  <Link
                    id={`sidebar-item-${nav.name.toLowerCase().replace(/\s+/g, '-')}`}
                    href={nav.path}
                    prefetch={false}
                    onClick={handleLinkClick}
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-all duration-150 ${
                      isActive(nav.path)
                        ? "bg-indigo-600/15 text-white ring-1 ring-indigo-500/25 shadow-sm"
                        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                    } ${!showLabels ? "lg:justify-center" : "justify-start"}`}
                  >
                    {isActive(nav.path) && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    )}
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center transition-colors duration-150 ${
                        isActive(nav.path)
                          ? "text-indigo-400"
                          : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {showLabels && <span className="truncate">{nav.name}</span>}
                  </Link>
                )
              )}

              {nav.subItems && showLabels && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${menuType}-${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-200"
                  style={{
                    height: groupOpen
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                  }}
                >
                  <ul className="mb-1 ml-4 mt-1 space-y-0.5 border-l border-slate-800 pl-3">
                    {nav.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          id={`sidebar-subitem-${subItem.name.toLowerCase().replace(/\s+/g, '-')}`}
                          href={subItem.path}
                          prefetch={false}
                          onClick={handleLinkClick}
                          className={`group flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition-all duration-150 ${
                            isActive(subItem.path)
                              ? "bg-indigo-600/10 font-semibold text-indigo-300 ring-1 ring-indigo-500/20"
                              : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full transition-colors duration-150 ${
                              isActive(subItem.path)
                                ? "bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.7)]"
                                : "bg-slate-600 group-hover:bg-slate-400"
                            }`}
                          />
                          <span className="truncate">{subItem.name}</span>
                          <span className="ml-auto flex items-center gap-1">
                            {subItem.new && (
                              <span className="rounded bg-indigo-500/15 border border-indigo-500/30 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-indigo-300">
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span className="rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  useEffect(() => {
    let submenuMatched = false;
    (["main", "others"] as const).forEach((menuType) => {
      const items = menuType === "main" ? filteredNavItems : filteredOthersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: menuType, index });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const filterItems = useCallback((items: NavItem[]) => {
    return items
      .map((item) => {
        if (item.subItems) {
          const filteredSub = item.subItems.filter((sub) =>
            hasPermission(sub.path, role)
          );
          return { ...item, subItems: filteredSub };
        }
        return item;
      })
      .filter((item) => {
        if (item.subItems) return item.subItems.length > 0;
        if (item.path) return hasPermission(item.path, role);
        return true;
      });
  }, [role]);

  const filteredNavItems = React.useMemo(() => {
    const isManagerOrTL = role === "MANAGER" || role === "TEAM_LEADER";
    const baseItems = navItems
      .filter((item) =>
        ["Dashboard", "Dialer Call Logs", "Teams", "CRM", "EMI Calculator"].includes(item.name)
      )
      .map((item) => {
        if (item.name === "Teams" && isManagerOrTL) {
          return { ...item, name: "My Team" };
        }
        return item;
      });
    return filterItems(baseItems);
  }, [filterItems, role]);

  const filteredOthersItems = React.useMemo(() => {
    const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";
    const baseItems = isAdmin ? othersItems : [];
    return filterItems(baseItems);
  }, [filterItems, role]);

  useEffect(() => {
    const handleOpenAdminMenu = () => {
      // Find the index of "Administration" in filteredOthersItems
      const index = filteredOthersItems.findIndex(item => item.name === "Administration");
      if (index !== -1) {
        setOpenSubmenu({ type: "others", index });
      }
    };
    window.addEventListener("open-admin-menu", handleOpenAdminMenu);
    return () => window.removeEventListener("open-admin-menu", handleOpenAdminMenu);
  }, [filteredOthersItems]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      id="sidebar-menu"
      className={`fixed left-0 top-0 z-50 mt-16 flex h-[calc(100vh-64px)] flex-col border-r border-slate-800/80 bg-[#0b0f19] px-3 text-slate-300 shadow-xl transition-all duration-300 ease-in-out lg:mt-0 lg:h-screen
        ${isExpanded || isMobileOpen ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
    >
      {/* ── Brand Header ── */}
      <div className={`flex shrink-0 items-center justify-between pt-5 pb-5 border-b border-slate-800/60 mb-2 transition-all duration-300 ${!showLabels ? "lg:justify-center px-0" : "px-2"}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 font-extrabold text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/20">
            <span className="text-sm font-black tracking-wider">F2</span>
          </div>
          {showLabels && (
            <div className="flex flex-col overflow-hidden whitespace-nowrap transition-opacity duration-300">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold tracking-tight text-white leading-none">
                  F2 CRM
                </span>
                <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[9px] font-bold tracking-wider text-indigo-400 border border-indigo-500/25">
                  ENTERPRISE
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 mt-1">
                Workspace Hub
              </span>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        {isMobileOpen && (
          <button
            onClick={toggleMobileSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-4">
          <div className="flex flex-col gap-4">
            {!isLoading && (
              <>
                {filteredNavItems.length > 0 && (
                  <div>
                    <h2
                      className={`mb-2 flex text-[10px] font-bold uppercase tracking-wider text-slate-400 ${!showLabels ? "lg:justify-center" : "justify-start px-2"
                        }`}
                    >
                      {showLabels ? "Core CRM" : <HorizontaLDots />}
                    </h2>
                    {renderMenuItems(filteredNavItems, "main")}
                  </div>
                )}

                {filteredOthersItems.length > 0 && (
                  <div>
                    <h2
                      className={`mb-2 flex text-[10px] font-bold uppercase tracking-wider text-slate-400 ${!showLabels ? "lg:justify-center" : "justify-start px-2"
                        }`}
                    >
                      {showLabels ? "Operations & Admin" : <HorizontaLDots />}
                    </h2>
                    {renderMenuItems(filteredOthersItems, "others")}
                  </div>
                )}
              </>
            )}
          </div>
        </nav>
        {showLabels ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
