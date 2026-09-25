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

export default function SingleSelect({ options, value, onChange, placeholder = "Select...", label }: SingleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()));
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>}
      <div 
        className="min-h-[44px] w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-2 outline-none transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 dark:bg-gray-800 dark:border-gray-700 flex gap-2 items-center justify-between px-3"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearch("");
        }}
      >
        <span className={`text-sm ${!selectedOption ? 'text-gray-400' : 'text-gray-900 dark:text-white truncate'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="px-3 pb-2 pt-1 sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md py-1.5 pl-8 pr-3 text-sm outline-none focus:border-brand-500 dark:text-white"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={e => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">No results found</div>
          ) : (
            filteredOptions.map(opt => {
              const isSelected = value === opt.value;
              return (
                <div 
                  key={opt.value} 
                  className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${isSelected ? 'bg-gray-50 dark:bg-gray-700/50 text-brand-600 dark:text-brand-400 font-medium' : 'text-gray-700 dark:text-gray-200'}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  {opt.label}
                  {isSelected && <Check size={16} />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
