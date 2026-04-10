import React from "react";
import { useLocationAutocomplete } from "../hooks/useLocationAutocomplete";

interface LocationAutocompleteProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPlaceSelect?: (location: any) => void;
  error?: any;
  fallbackErrorMessage?: string;
  disableValidation?: boolean;
}

const LocationAutocomplete = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Search location...",
  className = "",
  error,
  fallbackErrorMessage = "Please select a location from the dropdown suggestions",
  disableValidation = false,
  ...props
}: LocationAutocompleteProps) => {
  const {
    inputRef,
    inputValue,
    isValidSelection,
    handleInputChange,
    handleInputBlur,
    isLoaded,
    loadError,
    suggestions,
    isSearchingFallback,
    handleSuggestionSelect,
  } = useLocationAutocomplete({ value, onChange, onPlaceSelect });

  if (loadError && !suggestions.length && !inputValue) {
    return (
      <div className="relative">
        <input
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Location search (limited mode active)..."
          className={`w-full px-3 py-2 rounded-lg border border-gray-200 bg-yellow-50/30 focus:bg-white focus:border-blue-400 transition-all duration-200 outline-none font-medium text-gray-700 placeholder:text-gray-300 ${className}`}
        />
        <div className="mt-1 text-[10px] text-gray-400 italic px-1">
          Google Maps SDK failed to load. Falling back to secure server-side search.
        </div>
      </div>
    );
  }

  const hasError = !disableValidation && !isValidSelection && inputValue.trim() !== "";

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-400 transition-all duration-200 outline-none font-medium text-gray-700 placeholder:text-gray-300 ${className} ${(hasError || error) ? "border-red-500" : ""}`}
        {...props}
      />
      
      {/* Fallback Suggestions Dropdown - Show if SDK failed OR if we are getting server suggestions */}
      {(loadError || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 z-[1001] mt-1 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {isSearchingFallback && suggestions.length === 0 && (
            <div className="px-3 py-2 text-[10px] text-gray-400 animate-pulse">Searching securely...</div>
          )}
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSuggestionSelect(s)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="font-medium text-gray-700">{s.description}</div>
            </button>
          ))}
          {suggestions.length > 0 && !isLoaded && (
            <div className="px-3 py-1 bg-gray-50 text-[9px] text-gray-400 text-center uppercase tracking-tighter">
              Secure Server-Side Search
            </div>
          )}
        </div>
      )}

      {(hasError || error) && (
        <div className="mt-1 text-xs text-red-500">
          {error || fallbackErrorMessage}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
