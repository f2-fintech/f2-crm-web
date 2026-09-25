import React, { useState, useRef, useEffect } from "react";
import { Search, X, Check } from "lucide-react";

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

export default function MultiSelect({ options, value, onChange, placeholder = "Select...", label }: MultiSelectProps) {
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
  const selectedOptions = options.filter(opt => value.includes(opt.value));

  const toggleOption = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter(v => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  const removeOption = (e: React.MouseEvent, optValue: string) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optValue));
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>}
      <div 
        className="min-h-[44px] w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-2 outline-none transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 dark:bg-gray-800 dark:border-gray-700 flex flex-wrap gap-1 items-center"
        onClick={() => setIsOpen(true)}
      >
        {selectedOptions.length === 0 && <span className="text-gray-400 pl-2 text-sm">{placeholder}</span>}
        {selectedOptions.map(opt => (
          <span key={opt.value} className="flex items-center gap-1 rounded-md bg-brand-50 text-brand-700 px-2 py-1 text-xs font-medium dark:bg-brand-500/20 dark:text-brand-300">
            {opt.label}
            <button type="button" onClick={(e) => removeOption(e, opt.value)} className="hover:text-brand-900 dark:hover:text-brand-100">
              <X size={12} />
            </button>
          </span>
        ))}
        <input 
          type="text" 
          className="flex-1 min-w-[60px] bg-transparent outline-none text-sm dark:text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:bg-gray-800 dark:border-gray-700">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">No results found</div>
          ) : (
            filteredOptions.map(opt => {
              const isSelected = value.includes(opt.value);
              return (
                <div 
                  key={opt.value} 
                  className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${isSelected ? 'bg-gray-50 dark:bg-gray-700/50 text-brand-600 dark:text-brand-400 font-medium' : 'text-gray-700 dark:text-gray-200'}`}
                  onClick={() => toggleOption(opt.value)}
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
