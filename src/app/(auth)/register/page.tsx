"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";

export default function RegisterSelectionPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirection logic is centralized in /profile
        router.replace("/profile");
    }, [router]);

    return (
        <div className="min-h-[calc(100vh-82px)] flex items-center justify-center bg-gray-50">
            <Spinner size="lg" />
        </div>
    );
}
