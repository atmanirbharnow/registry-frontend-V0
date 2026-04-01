"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PublicShell from "@/components/PublicShell";
import Spinner from "@/components/ui/Spinner";


export default function SchoolVerifyRedirectPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    useEffect(() => {
        if (id) {
            // Redirect to the unified verification route
            router.replace(`/verify/${id}`);
        }
    }, [id, router]);

    return (
        <PublicShell>
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
                <Spinner size="lg" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                    Relocating to Unified Verification...
                </p>
            </div>
        </PublicShell>
    );
}
