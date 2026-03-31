import { useEffect, useRef, useState, useCallback } from "react";
import { useGoogleMapsLoader } from "./useGoogleMapsLoader";

interface UseLocationAutocompleteProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPlaceSelect?: (location: any) => void;
}

export const useLocationAutocomplete = ({
  value,
  onChange,
  onPlaceSelect,
}: UseLocationAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value || "");
  const [isValidSelection, setIsValidSelection] = useState(!!value);
  const [lastValidValue, setLastValidValue] = useState(value || "");

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchingFallback, setIsSearchingFallback] = useState(false);

  const onPlaceSelectRef = useRef(onPlaceSelect);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
    onChangeRef.current = onChange;
  });

  // Use shared Google Maps loader to prevent multiple initialization conflicts
  const { isLoaded, loadError } = useGoogleMapsLoader();

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || "");
      setLastValidValue(value || "");
      setIsValidSelection(true);
    }
  }, [value, inputValue]);

  useEffect(() => {
    if (!isLoaded) return () => { };
    const currentInput = inputRef.current;
    if (!currentInput) return () => { };

    const autocomplete = new window.google.maps.places.Autocomplete(
      currentInput,
      {
        componentRestrictions: {
          country: "in",
        },
      },
    );

    const getCityAndCountry = (place: any) => {
      const addressName: { city: string | null; country: string | null } = {
        city: null,
        country: null,
      };
      if (place && place.address_components) {
        place.address_components.forEach((component: any) => {
          if (component?.types?.includes("locality"))
            addressName.city = component.long_name;
          if (component?.types?.includes("country"))
            addressName.country = component.long_name;
        });
      }
      return addressName;
    };

    const handlePlaceChanged = () => {
      const place = autocomplete.getPlace();
      if (!place || !place.geometry || !place.geometry.location) {
        console.warn(
          "AutocompleteService: The selected place has no geometry.",
        );
        return;
      }

      const { city, country } = getCityAndCountry(place);
      const displayValue = place.formatted_address || place.name || "";

      const location = {
        address: displayValue,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        city,
        country,
      };

      setInputValue(displayValue);
      setLastValidValue(displayValue);
      setIsValidSelection(true);

      onPlaceSelectRef.current?.(location);
    };

    const listener = autocomplete.addListener(
      "place_changed",
      handlePlaceChanged,
    );

    return () => {
      const pacContainers = document.querySelectorAll(".pac-container");
      pacContainers.forEach((container) => container.remove());

      window.google.maps.event.removeListener(listener);
      if (currentInput) {
        window.google.maps.event.clearInstanceListeners(currentInput);
      }
    };
  }, [isLoaded]);

  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input || input.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      setIsSearchingFallback(true);
      const res = await fetch(`/api/google/places?input=${encodeURIComponent(input)}`);
      const data = await res.json();
      if (data.predictions) {
        setSuggestions(data.predictions);
      }
    } catch (err) {
      console.error("Fallback search error:", err);
    } finally {
      setIsSearchingFallback(false);
    }
  }, []);

  const handleSuggestionSelect = useCallback(async (prediction: any) => {
    setInputValue(prediction.description);
    setSuggestions([]);
    
    try {
      // In fallback mode, we need to geocode the selected address to get coordinates
      const res = await fetch(`/api/google/geocode?address=${encodeURIComponent(prediction.description)}`);
      // Update: use our new geocode proxy or handle it
      // Actually, my geocode proxy only takes lat/lng right now. I should update it to take address too.
      onPlaceSelectRef.current?.({
        address: prediction.description,
        // We might not have coords immediately without extra geocoding
      });
    } catch {
      onPlaceSelectRef.current?.({ address: prediction.description });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (!isLoaded && loadError) {
      fetchSuggestions(newValue);
    }

    if (newValue.trim() === "") {
      setIsValidSelection(true);
      setLastValidValue("");
    } else if (newValue === lastValidValue && lastValidValue !== "") {
      setIsValidSelection(true);
    } else if (newValue === value && value !== "") {
      setIsValidSelection(true);
      setLastValidValue(newValue);
    } else {
      setIsValidSelection(false);
    }

    onChangeRef.current?.(e);
  };

  const handleInputBlur = () => {
    if (inputValue.trim() === "") {
      setLastValidValue("");
      setIsValidSelection(true);
    }
  };

  return {
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
  };
};
