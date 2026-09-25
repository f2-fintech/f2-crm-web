"use client";

import React, { useEffect, useRef, useState } from "react";
import { Languages } from "lucide-react";

export default function TranslateDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add Google Translate script if not exists
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: "en", layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE },
          "google_translate_element"
        );
      };
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        title="Translate"
        aria-label="Translate"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <Languages className="h-[18px] w-[18px]" />
      </button>

      <div
        className={`absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">Translate Page</h4>
        
        <style>{`
          .goog-te-banner-frame.skiptranslate { display: none !important; }
          body { top: 0px !important; }
          .goog-logo-link { display: none !important; }
          .goog-te-gadget { color: transparent !important; font-size: 0px !important; }
          .goog-te-gadget .goog-te-combo {
            width: 100%;
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            background-color: #f9fafb;
            color: #374151 !important;
            font-size: 14px !important;
            outline: none;
            cursor: pointer;
            margin: 0 !important;
          }
          .dark .goog-te-combo {
            background-color: #1f2937 !important;
            border-color: #374151 !important;
            color: #e5e7eb !important;
          }
          #goog-gt-tt, .goog-te-balloon-frame { display: none !important; }
          .goog-text-highlight { background: none !important; box-shadow: none !important; }
        `}</style>

        <div id="google_translate_element" className="w-full"></div>
        <p className="mt-3 text-xs text-gray-500">
          Select a language above to translate the CRM into your preferred language.
        </p>
      </div>
    </div>
  );
}
