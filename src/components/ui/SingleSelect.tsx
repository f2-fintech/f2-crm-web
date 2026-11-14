import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SingleSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export default function SingleSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
}: SingleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );
  const selectedOption = options.find((opt) => opt.value === value);

  const handleToggle = () => {
    setIsOpen((prev) => {
      if (!prev) setSearch("");
      return !prev;
    });
  };

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={handleToggle}
        className="flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-left outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800"
      >
        <span
          className={`truncate text-sm ${
            !selectedOption ? "text-gray-400" : "text-gray-900 dark:text-white"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          {/* Search */}
          <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-700">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                ref={searchRef}
                type="text"
                className="w-full rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-52 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                No results found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = value === opt.value;
                return (
                  <div
                    key={opt.value}
                    className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      isSelected
                        ? "bg-brand-50 font-medium text-brand-600 dark:bg-brand-500/20 dark:text-brand-400"
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                    onClick={() => handleSelect(opt.value)}
                  >
                    {opt.label}
                    {isSelected && <Check size={16} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
