import { useState, useEffect } from 'react';

export const usePincodeLookup = (pincode: string | undefined | null) => {
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!pincode || String(pincode).trim().length !== 6) {
            setState("");
            setCity("");
            setError("");
            return;
        }

        const fetchPincodeDetails = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`/api/pincode/${pincode}`);
                const data = await res.json();
                if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
                    const postOffice = data[0].PostOffice[0];
                    setState(postOffice.State);
                    setCity(postOffice.District);
                } else {
                    setError("Invalid Pincode or no data found");
                    setState("");
                    setCity("");
                }
            } catch (err) {
                setError("Failed to fetch location data");
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchPincodeDetails, 500);
        return () => clearTimeout(timeoutId);
    }, [pincode]);

    return { state, city, loading, error, setState, setCity };
};
