"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin } from "lucide-react";

// UK cities/regions for autocomplete
const ukLocations = [
  "London", "Manchester", "Birmingham", "Leeds", "Liverpool", "Bristol",
  "Sheffield", "Newcastle", "Nottingham", "Leicester", "Brighton", "Edinburgh",
  "Glasgow", "Cardiff", "Belfast", "Southampton", "Oxford", "Cambridge",
  "Bath", "York", "Exeter", "Norwich", "Reading", "Coventry",
  "Essex", "Surrey", "Kent", "Hampshire", "Devon", "Cornwall",
  "Hertfordshire", "Buckinghamshire", "Berkshire", "Suffolk", "Norfolk",
  "Dorset", "Somerset", "Wiltshire", "Gloucestershire", "Oxfordshire",
  "Warwickshire", "Staffordshire", "Derbyshire", "Lincolnshire",
  "UK Wide", "Nationwide", "South East", "South West", "East Midlands",
  "West Midlands", "North West", "North East", "East of England", "Yorkshire",
  "Scotland", "Wales", "Northern Ireland",
];

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function LocationSearch({ value, onChange, placeholder }: LocationSearchProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInputChange(val: string) {
    setQuery(val);
    onChange(val);

    if (val.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const q = val.toLowerCase();
    const matches = ukLocations
      .filter((loc) => loc.toLowerCase().includes(q))
      .slice(0, 6);
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  }

  function selectLocation(loc: string) {
    setQuery(loc);
    onChange(loc);
    setShowSuggestions(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
      <input
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setShowSuggestions(true);
        }}
        className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none"
        placeholder={placeholder || "Start typing a location..."}
        autoComplete="off"
      />
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {suggestions.map((loc) => (
            <button
              key={loc}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectLocation(loc)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#e2b33e]/10 hover:text-[#1a1a2e] transition-colors flex items-center gap-2"
            >
              <MapPin size={12} className="text-gray-400" />
              {loc}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
