import { useEffect, useRef, useState, useCallback } from "react";
import { useGoogleMapsLoader } from "./useGoogleMapsLoader";

interface UseSchoolAutocompleteProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPlaceSelect?: (location: any) => void;
}

export const useSchoolAutocomplete = ({
  value,
  onChange,
  onPlaceSelect,
}: UseSchoolAutocompleteProps) => {
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

  const { isLoaded, loadError } = useGoogleMapsLoader();

  const prevValueProp = useRef(value);
  useEffect(() => {
    // Only update internal state if the prop changed from its previous value
    // AND it's different from our current internal state
    if (value !== prevValueProp.current && value !== inputValue) {
      setInputValue(value || "");
      setLastValidValue(value || "");
      setIsValidSelection(true);
    }
    prevValueProp.current = value;
  }, [value, inputValue]);

  useEffect(() => {
    if (!isLoaded) return () => { };
    const currentInput = inputRef.current;
    if (!currentInput) return () => { };

    // Gujarat, India (lat: 22.2587, lng: 71.1924, radius: 300000m)
    const gujaratBounds = new window.google.maps.Circle({
      center: { lat: 22.2587, lng: 71.1924 },
      radius: 300000,
    }).getBounds();

    const autocomplete = new window.google.maps.places.Autocomplete(
      currentInput,
      {
        types: ["school"],
        bounds: gujaratBounds || undefined,
        componentRestrictions: { country: "in" },
        fields: ["address_components", "formatted_address", "geometry", "name", "place_id"],
      },
    );

    const handlePlaceChanged = () => {
      const place = autocomplete.getPlace();
      if (!place || !place.geometry || !place.geometry.location) {
        return;
      }

      let city = "";
      let pincode = "";

      if (place.address_components) {
        place.address_components.forEach((component: any) => {
          if (component.types.includes("locality")) city = component.long_name;
          if (component.types.includes("postal_code")) pincode = component.long_name;
        });
      }

      const location = {
        schoolName: place.name || "",
        address: place.formatted_address || "",
        city: city,
        pincode: pincode,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        place_id: place.place_id,
      };

      setInputValue(place.name || "");
      setLastValidValue(place.name || "");
      setIsValidSelection(true);

      onPlaceSelectRef.current?.(location);
    };

    const listener = autocomplete.addListener("place_changed", handlePlaceChanged);

    return () => {
      const pacContainers = document.querySelectorAll(".pac-container");
      pacContainers.forEach((container) => container.remove());
      window.google.maps.event.removeListener(listener);
    };
  }, [isLoaded]);

  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input || input.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      setIsSearchingFallback(true);
      const res = await fetch(`/api/google/places?input=${encodeURIComponent(input)}&types=school`);
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
      const data = await res.json();
      
      let lat: number | undefined;
      let lng: number | undefined;
      let city = "";
      let pincode = "";

      if (data.results && data.results[0]) {
        const result = data.results[0];
        lat = result.geometry.location.lat;
        lng = result.geometry.location.lng;
        
        result.address_components.forEach((component: any) => {
          if (component.types.includes("locality")) city = component.long_name;
          if (component.types.includes("postal_code")) pincode = component.long_name;
        });
      }

      onPlaceSelectRef.current?.({
        schoolName: prediction.structured_formatting?.main_text || prediction.description,
        address: prediction.description,
        city,
        pincode,
        lat,
        lng,
        place_id: prediction.place_id
      });
      
      setIsValidSelection(true);
      setLastValidValue(prediction.description);
    } catch (err) {
      console.error("Fallback geocode error:", err);
      onPlaceSelectRef.current?.({ 
        schoolName: prediction.structured_formatting?.main_text || prediction.description,
        address: prediction.description,
        place_id: prediction.place_id
      });
      setIsValidSelection(true);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Trigger fallback search if SDK failed to load OR if it loaded but is non-functional (e.g. InvalidKeyMapError)
    const isSDKFunctional = isLoaded && !!window.google?.maps?.places;
    if (loadError || !isSDKFunctional) {
      fetchSuggestions(newValue);
    }

    if (newValue.trim() === "") {
      setIsValidSelection(true);
      setLastValidValue("");
    } else {
      setIsValidSelection(false);
    }

    onChangeRef.current?.(e);
  };

  return {
    inputRef,
    inputValue,
    isValidSelection,
    handleInputChange,
    isLoaded,
    loadError,
    suggestions,
    isSearchingFallback,
    handleSuggestionSelect,
  };
};
