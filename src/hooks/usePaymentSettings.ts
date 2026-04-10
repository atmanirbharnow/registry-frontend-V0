"use client";

import { useState, useEffect, useCallback } from "react";
import { getPaymentSettings, PaymentSettings } from "@/lib/firestoreService";

export function usePaymentSettings() {
    const [settings, setSettings] = useState<PaymentSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getPaymentSettings();
            setSettings(data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch payment settings:", err);
            setError("Failed to load payment settings");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return {
        settings,
        loading,
        error,
        refreshSettings: fetchSettings,
        individualPrice: settings?.individualPrice ?? 1,
        schoolPrice: settings?.schoolPrice ?? 1,
    };
}
