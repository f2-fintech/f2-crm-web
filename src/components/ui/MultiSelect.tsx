import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check, Search } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
}

export default function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
}: MultiSelectProps) {
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
  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  const toggleOption = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  const removeOption = (e: React.MouseEvent, optValue: string) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optValue));
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {/* Trigger: entire area is clickable */}
      <div
        className="flex min-h-[44px] w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        {selectedOptions.length === 0 && (
          <span className="select-none text-sm text-gray-400">
            {placeholder}
          </span>
        )}

        {selectedOptions.map((opt) => (
          <span
            key={opt.value}
            className="flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-300"
          >
            {opt.label}
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => removeOption(e, opt.value)}
              className="ml-0.5 hover:text-brand-900 dark:hover:text-brand-100"
            >
              <X size={11} />
            </button>
          </span>
        ))}

        {/* Invisible expander so click target is always full width */}
        <span className="flex-1" />

        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          {/* Search box inside dropdown */}
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
                const isSelected = value.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      isSelected
                        ? "bg-brand-50 font-medium text-brand-600 dark:bg-brand-500/20 dark:text-brand-400"
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                    onClick={() => toggleOption(opt.value)}
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
