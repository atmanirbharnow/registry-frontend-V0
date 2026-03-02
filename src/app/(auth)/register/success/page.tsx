"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getActionByRegistryId } from "@/lib/firestoreService";
import { ACTION_LABELS } from "@/lib/constants";
import { Action } from "@/types/action";
import QRCode from "@/components/QRCode";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";

export default function RegisterSuccessPage() {
    const searchParams = useSearchParams();
    const registryId = searchParams.get("id");
    const [action, setAction] = useState<Action | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAction() {
            if (!registryId) {
                setLoading(false);
                return;
            }
            try {
                const data = await getActionByRegistryId(registryId);
                setAction(data);
            } catch {
                // action not found
            } finally {
                setLoading(false);
            }
        }

        fetchAction();
    }, [registryId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-82px)] bg-gray-50">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!registryId || !action) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-82px)] bg-gray-50 px-4">
                <h1 className="text-2xl font-black text-gray-800 mb-2">
                    Action Not Found
                </h1>
                <p className="text-gray-500 mb-6">
                    No registry ID was provided or the action could not be found.
                </p>
                <Link href="/register">
                    <Button>Register New Action</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-82px)] bg-gray-50 px-4 md:px-8 py-12">
            <div className="max-w-xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-black text-gray-800">
                        Action Registered!
                    </h1>
                    <p className="text-gray-500">
                        Your action has been successfully registered and payment confirmed.
                    </p>
                </div>

                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-8 py-8 space-y-4">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Registry ID
                        </p>
                        <p className="text-3xl font-black text-[rgb(32,38,130)] font-mono mt-1">
                            {action.registryId}
                        </p>
                    </div>

                    <div className="border-t border-gray-100 pt-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Action Type</span>
                            <span className="text-sm font-medium text-gray-700">
                                {ACTION_LABELS[action.actionType] || action.actionType}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Quantity</span>
                            <span className="text-sm font-medium text-gray-700">
                                {action.quantity} {action.unit}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-400">CO₂e</span>
                            <span className="text-sm font-medium text-gray-700">
                                {action.co2eKg != null ? `${action.co2eKg.toFixed(3)} kg` : "—"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Status</span>
                            <span className="text-sm font-semibold text-yellow-600">
                                Pending Verification
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <QRCode registryId={action.registryId} size={180} />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href={`/verify/${action.registryId}`}>
                        <Button variant="secondary">View Verification Page</Button>
                    </Link>
                    <Link href="/profile">
                        <Button>Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
