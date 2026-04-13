"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getActionByRegistryId } from "@/lib/firestoreService";
import { getSchoolByRegistryId } from "@/lib/schoolFirestoreService";
import PublicImpactSummary from "@/components/PublicImpactSummary";
import Spinner from "@/components/ui/Spinner";
import PublicShell from "@/components/PublicShell";
import Link from "next/link";
import { Action } from "@/types/action";
import { School } from "@/types/school";

export default function PublicSummaryPage() {
    const params = useParams();
    const registryId = params.id as string;
    const [action, setAction] = useState<Action | null>(null);
    const [school, setSchool] = useState<School | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setNotFound(false);
            setAction(null);
            setSchool(null);
            
            try {
                // 1. Try Individual Action first
                const actionData = await getActionByRegistryId(registryId);
                if (actionData) {
                    setAction(actionData);
                    return;
                }

                // 2. Try School if not found
                const schoolData = await getSchoolByRegistryId(registryId);
                if (schoolData) {
                    setSchool(schoolData);
                    return;
                }

                setNotFound(true);
            } catch (error) {
                console.error("Summary fetch error:", error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }
        if (registryId) {
            fetchData();
        }
    }, [registryId]);

    if (loading) {
        return (
            <PublicShell>
                <div className="flex justify-center items-center py-40">
                    <Spinner size="lg" />
                </div>
            </PublicShell>
        );
    }

    if (notFound || (!action && !school)) {
        return (
            <PublicShell>
                <div className="max-w-2xl mx-auto text-center py-20 px-4">
                    <h1 className="text-3xl font-black text-gray-800 mb-4 uppercase tracking-tighter">
                        Record Not Found
                    </h1>
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <p className="text-gray-500 mb-6">
                            No action or school found with Registry ID: <span className="font-mono font-bold text-[#003527]">{registryId}</span>
                        </p>
                        <Link href="/" className="inline-flex items-center gap-2 text-[#003527] font-bold hover:underline uppercase tracking-widest text-xs">
                            Return to Homepage
                        </Link>
                    </div>
                </div>
            </PublicShell>
        );
    }

    const data = action || school;
    const formValues = action ? {
        ...action,
        // Individual mapping
        beneficiaries_count: (action as any).beneficiaries_count || action.beneficiariesCount || (action as any).actions?.[0]?.beneficiariesCount || (action as any).actions?.[0]?.beneficiaries_count || "",
        actionTypes: action.actionType ? [action.actionType] : ((action as any).actions?.map((a: any) => a.actionType || a.action_type) || []),
        actionDetails: {
            [action.actionType || (action as any).actions?.[0]?.actionType || ""]: {
                quantity: action.quantity || (action as any).actionQuantity || (action as any).actions?.[0]?.quantity || 0,
                unit: action.unit || (action as any).actions?.[0]?.unit || "units",
                commissioningDate: action.commissioningDate || (action as any).commissioning_date || (action as any).dateOfInstallation || (action as any).actions?.[0]?.commissioningDate || (action as any).actions?.[0]?.commissioning_date || "—"
            }
        }
    } : {
        ...school,
        // School mapping
        students_count: (school as any).students_count || (school as any).studentsCount || "",
        actionTypes: school?.action_type ? [school.action_type] : ((school as any).actions?.map((a: any) => a.actionType || a.action_type) || []),
        actionDetails: (school as any).actions?.reduce((acc: any, a: any) => {
            const type = a.actionType || a.action_type;
            if (type) {
                acc[type] = {
                    quantity: a.quantity || a.value || 0,
                    unit: a.unit || "units",
                    commissioningDate: a.commissioningDate || a.commissioning_date || a.installationDate || "—"
                };
            }
            return acc;
        }, {}) || {
            [school?.action_type || ""]: {
                quantity: (school as any).actionQuantity || (school as any).waste_diverted_kg || (school as any).quantity || 0,
                unit: (school as any).unit || "units",
                commissioningDate: (school as any).commissioningDate || (school as any).commissioning_date || (school as any).dateOfInstallation || "—"
            }
        }
    };

    return (
        <PublicShell>
            <div className="max-w-4xl mx-auto py-12 px-4 md:px-0">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                            Calculation View
                        </h1>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                            Project Details & Impact Verifier
                        </p>
                    </div>
                    <Link 
                        href={`/verify/${registryId}`}
                        className="px-4 py-2 border-2 border-[#003527] text-[#003527] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#003527] hover:text-white transition-all"
                    >
                        Back to Certificate
                    </Link>
                </div>
                
                <PublicImpactSummary 
                    isSchool={!!school} 
                    formValues={formValues} 
                    userProfile={{ 
                        displayName: action?.actorName || school?.schoolName || (data as any)?.contactName,
                        email: action?.email || school?.email || (data as any)?.email,
                        phone: action?.phone || school?.phone || (data as any)?.phone,
                        institutionType: action?.actorType || (school ? "School" : undefined),
                        state: action?.state || school?.state,
                        pincode: action?.pincode || school?.pincode,
                        contactPerson: action?.contactPerson || (data as any)?.contactPerson || (data as any)?.contact_person,
                    }} 
                />
            </div>
        </PublicShell>
    );
}
