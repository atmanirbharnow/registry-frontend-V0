import React from "react";
import { useSchoolAutocomplete } from "../hooks/useSchoolAutocomplete";

interface SchoolAutocompleteProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onPlaceSelect?: (location: any) => void;
  onManualEntry?: (name: string) => void;
  error?: string;
}

const SchoolAutocomplete = ({
  value,
  onChange,
  onPlaceSelect,
  onManualEntry,
  placeholder = "Search for school name...",
  className = "",
  error,
  ...props
}: SchoolAutocompleteProps) => {
  const {
    inputRef,
    inputValue,
    isValidSelection,
    handleInputChange,
    isLoaded,
    loadError,
    suggestions,
    isSearchingFallback,
    handleSuggestionSelect,
  } = useSchoolAutocomplete({ value, onChange, onPlaceSelect });

  return (
    <div className="relative space-y-2">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={isLoaded ? placeholder : (loadError ? "Search school..." : "Loading search...")}
          className={`w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 transition-all outline-none font-bold text-gray-900 placeholder:text-gray-400 text-lg ${
            error ? "border-red-500 bg-red-50" : "border-slate-300 focus:border-[#003527] focus:bg-white focus:shadow-lg focus:shadow-blue-900/5"
          } ${className}`}
          {...props}
        />
        
        {/* Fallback Suggestions Dropdown */}
        {loadError && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-[1001] mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSuggestionSelect(s)}
                className="w-full text-left px-5 py-4 text-sm hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
              >
                <div className="font-bold text-slate-800">{s.structured_formatting?.main_text || s.description}</div>
                <div className="text-[10px] text-slate-500 truncate">{s.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {!isValidSelection && inputValue.length > 2 && !isSearchingFallback && (
        <button
          type="button"
          onClick={() => onManualEntry?.(inputValue)}
          className="text-xs font-bold text-[#003527] hover:underline px-1"
        >
          School not found? Enter manually
        </button>
      )}

      {error && <p className="text-xs font-bold text-red-500 px-1">{error}</p>}
      {loadError && !suggestions.length && (
        <p className="text-[10px] text-orange-500 font-bold px-1 italic">
          Google Maps SDK blocked by domain. Using secure server-side backup search.
        </p>
      )}
    </div>
  );
};

export default SchoolAutocomplete;
