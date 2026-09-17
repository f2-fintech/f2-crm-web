"use client";

import { Search } from "lucide-react";
import { useRef, useEffect } from "react";

const FooterSearch = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.code === "Space") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative flex h-12 items-center bg-white">
      {/* Search Icon */}
      <Search
        size={18}
        className="absolute left-4 text-gray-400"
      />

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        placeholder="Here is your Smart Chat (Ctrl+Space)"
        className="h-full w-full bg-transparent pl-11 pr-28 text-sm text-gray-700 placeholder:text-gray-400 outline-none"
      />

      {/* Shortcut */}
      <div className="absolute right-3 flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-500">
        <kbd className="font-semibold">Ctrl</kbd>
        <span>+</span>
        <kbd className="font-semibold">Space</kbd>
      </div>
    </div>
  );
};

export default FooterSearch;