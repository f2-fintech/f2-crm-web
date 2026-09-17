"use client";

import { useEffect, useState } from "react";
import {
  Megaphone,
  ScanSearch,
  ChartNoAxesCombined,
  ClipboardList,
  AlarmClock,
  History,
  Accessibility,
  HelpCircle,
  NotebookPen,
  X,
} from "lucide-react";

const actions = [
  {
    label: "Commands",
    icon: ScanSearch,
  },
  {
    label: "Announcements",
    icon: Megaphone,
  },
  {
    label: "Motivator",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Sticky Notes",
    icon: ClipboardList,
  },
  {
    label: "Activity Reminders",
    icon: AlarmClock,
  },
  {
    label: "Recent Items",
    icon: History,
  },
  {
    label: "Accessibility",
    icon: Accessibility,
  },
];

export default function FooterActions() {
  const [openNotebook, setOpenNotebook] = useState(false);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenNotebook(false);
    };

    window.addEventListener("keydown", esc);

    return () => window.removeEventListener("keydown", esc);
  }, []);

  return (
    <>
      <div className="flex h-12 bg-white border-l border-gray-200">

        {actions.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="group relative flex h-full w-12 cursor-pointer items-center justify-center border-r border-gray-200 hover:bg-gray-50 transition"
            >
              <Icon
                size={19}
                className="text-slate-700 group-hover:text-indigo-600 transition"
              />

              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-[999]">

                <div className="relative whitespace-nowrap rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-xl">

                  {item.label}

                  <div className="absolute left-1/2 top-full -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-slate-800" />

                </div>

              </div>

            </div>
          );
        })}

        {/* HELP */}

        <div className="group relative">

          <button
            className="flex h-12 w-16 items-center justify-center gap-1 bg-violet-500 text-white transition-all hover:bg-violet-600 active:scale-95"
            >
            <HelpCircle size={18} />
            <span className="text-sm font-semibold">Help</span>
            </button>

          <div className="pointer-events-none absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">

            <div className="relative rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-xl">

              Help

              <div className="absolute left-1/2 top-full -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-slate-800" />

            </div>

          </div>

        </div>

        {/* NOTEBOOK */}

        <div className="group relative">

          <button
            onClick={() => setOpenNotebook(true)}
            className="flex h-12 w-12 items-center justify-center border-r border-gray-200 hover:bg-gray-50 transition active:scale-95"
            >
            <NotebookPen
                size={20}
                className="text-slate-700"
            />
            </button>

          <div className="pointer-events-none absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">

            <div className="relative rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-xl">

              Notebook

              <div className="absolute left-1/2 top-full -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-slate-800" />

            </div>

          </div>

        </div>

      </div>
            {/* Overlay */}
      {openNotebook && (
        <div
          onClick={() => setOpenNotebook(false)}
          className="fixed inset-0 z-[998] bg-black/20"
        />
      )}

      {/* Notebook Drawer */}
      <div
        className={`fixed right-0 top-0 z-[999] h-screen w-[420px] bg-white shadow-2xl transition-transform duration-300 ${
          openNotebook ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex h-15 items-center justify-between border-b border-gray-200 px-5">
          <div className="flex items-center gap-3">
            <NotebookPen
              size={22}
              className="text-blue-600"
            />

            <span className="text-2xl font-semibold text-gray-800">
              Notebook
            </span>
          </div>

          <button
            onClick={() => setOpenNotebook(false)}
            className="rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-red-500"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="h-[calc(100vh-60px)] overflow-y-auto bg-white">

          {/* Temporary Empty State */}

          <div className="flex h-full items-center justify-center">

            <div className="text-center">
{/* 
              <NotebookPen
                size={65}
                className="mx-auto mb-5 text-gray-300"
              /> */}

              {/* <h3 className="text-xl font-semibold text-gray-700">
                Notebook
              </h3> */}

              <p className="mt-2 text-sm text-gray-500">
                Your notebook content will appear here.
              </p>

              <button
                onClick={() =>
                  window.open(
                    "#",
                    "_blank"
                  )
                }
                className="mt-6 rounded-lg bg-violet-600 px-5 py-2 text-white transition hover:bg-violet-700"
              >
                Open Notebook
              </button>

            </div>

          </div>

          {/*

          Later replace above section with

          <iframe
              src="#"
              className="h-full w-full"
          />

          */}

        </div>
      </div>

    </>
  );
}