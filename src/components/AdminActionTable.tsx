"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import Spinner from "./ui/Spinner";
import StatusBadge from "./ui/StatusBadge";
import CustomDropdown from "./ui/CustomDropdown";
import Input from "./ui/Input";
import Button from "./ui/Button";
import { ACTION_LABELS, ACTION_STATUS_OPTIONS, ACTION_TYPES } from "@/lib/constants";
import Link from "next/link";
import { Action, ActionStatus } from "@/types/action";
import { getAllActionsRealtime, updateActionStatus, getAllActions, getActionsByUserId } from "@/lib/firestoreService";
import { getAllSchoolsRealtime } from "@/lib/schoolFirestoreService";
import { useAuth } from "@/context/AuthContext";
import { calculatePortfolioMetrics, PortfolioMetrics } from "@/lib/portfolioCalculator";
import { syncPlatformStats } from "@/lib/statsSync";
import { School, SchoolStatus } from "@/types/school";
import { calculateSchoolImpact } from "@/lib/schoolCalculationEngine";
import { calculateImpactPhase2 } from "@/lib/calculationEngine";
import { SCHOOL_STATUS_OPTIONS } from "@/lib/constants/schoolConstants";
import { getAllUsers } from "@/lib/firestoreService";

type UnifiedItem = {
    id: string;
    registryId?: string;
    actionType: string;
    actorName: string;
    co2eKg: number;
    email: string;
    createdAt: any;
    status: string;
    entityType: "individual" | "school";
    originalData: Action | School;
    registryRevenue: number;
};

export default function AdminActionTable() {
    const { user } = useAuth();
    const [actions, setActions] = useState<Action[]>([]);
    const [schools, setSchools] = useState<School[]>([]);
    const [userCount, setUserCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [entityFilter, setEntityFilter] = useState<"all" | "individual" | "school">("all");

    const [verifyModalOpen, setVerifyModalOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [valuesApproved, setValuesApproved] = useState(false);
    const [userPortfolio, setUserPortfolio] = useState<PortfolioMetrics | null>(null);
    const [fetchingPortfolio, setFetchingPortfolio] = useState(false);
    const [verifyForm, setVerifyForm] = useState({
        co2eTonnes: "",
        atmanirbharPercent: "",
        circularityPercent: "",
        status: "verified" as ActionStatus,
        adminNotes: "",
        // Baseline Fields (Step 1)
        baselineEnergyGrid: "0",
        baselineEnergyDiesel: "0",
        baselineEnergySolar: "0",
        baselineWaterMunicipal: "0",
        baselineWaterRain: "0",
        baselineWaterWaste: "0",
        baselineWasteOrganic: "0",
        baselineWasteInorganic: "0",
        baselineWasteHazardous: "0",
        // Action Fields (Step 2)
        actionType: "",
        quantity: "0",
        unit: "",
        beneficiariesCount: "1",
    });

    // School Modal State
    const [verifySchoolModalOpen, setVerifySchoolModalOpen] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
    const [isSchoolEditMode, setIsSchoolEditMode] = useState(false);
    const [verifySchoolForm, setVerifySchoolForm] = useState({
        schoolName: "",
        address: "",
        baselineEnergyGrid: "0",
        baselineEnergyDiesel: "0",
        baselineEnergySolar: "0",
        baselineWaterMunicipal: "0",
        baselineWaterRain: "0",
        baselineWaterWaste: "0",
        baselineWasteOrganic: "0",
        baselineWasteInorganic: "0",
        baselineWasteHazardous: "0",
        actionType: "",
        actionQuantity: "0",
        students_count: "1",
        status: "verified" as SchoolStatus,
        adminNotes: "",
    });

    const [verifySubmitting, setVerifySubmitting] = useState(false);

    useEffect(() => {
        const unsubscribeActions = getAllActionsRealtime((fetchedActions) => {
            setActions(fetchedActions);
            if (entityFilter !== 'school') setLoading(false);
        });

        const unsubscribeSchools = getAllSchoolsRealtime((fetchedSchools) => {
            setSchools(fetchedSchools);
            setLoading(false);
        });

        getAllUsers().then(users => setUserCount(users.length)).catch(console.error);

        return () => {
            unsubscribeActions();
            unsubscribeSchools();
        };
    }, [entityFilter]);

    const unifiedItems: UnifiedItem[] = useMemo(() => {
        const mappedActions: UnifiedItem[] = actions.map(a => ({
            id: a.id,
            registryId: a.registryId,
            actionType: ACTION_LABELS[a.actionType] || a.actionType,
            actorName: a.actorName || "N/A",
            co2eKg: a.co2eKg || 0,
            email: a.userEmail || "N/A",
            createdAt: a.createdAt,
            status: a.status || "pending",
            entityType: "individual",
            originalData: a,
            registryRevenue: a.registryId ? 1 : 0
        }));

        const mappedSchools: UnifiedItem[] = schools.map(s => ({
            id: s.id,
            registryId: s.registryId,
            actionType: s.action_type || "School",
            actorName: s.schoolName || "N/A",
            co2eKg: (s.tco2e_annual || 0) * 1000,
            email: s.email || "N/A",
            createdAt: s.createdAt,
            status: s.status || "pledged",
            entityType: "school",
            originalData: s,
            registryRevenue: s.registryId ? 1 : 0
        }));

        const combined = [...mappedActions, ...mappedSchools];

        return combined.filter(item => {
            if (entityFilter !== "all" && item.entityType !== entityFilter) return false;
            if (statusFilter !== "all" && item.status !== statusFilter) return false;
            if (typeFilter !== "all" && item.actionType !== typeFilter) return false;
            return true;
        }).sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
            const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
        });
    }, [actions, schools, entityFilter, statusFilter, typeFilter]);

    const stats = useMemo(() => {
        const filtered = unifiedItems;
        const total = filtered.length;
        const verified = filtered.filter((i) => i.status === "verified").length;
        const totalCo2e = filtered.reduce((sum, i) => sum + (i.co2eKg || 0), 0);
        const totalRevenue = filtered.reduce((sum, i) => sum + i.registryRevenue, 0);
        
        // Organizations count: 
        // If "all" -> userCount
        // If "individual" -> unique actorName/email count for actions? 
        // If "school" -> unique school count (which is schools.length)
        let orgCount = userCount;
        if (entityFilter === "school") orgCount = schools.length;
        else if (entityFilter === "individual") orgCount = new Set(actions.map(a => a.userEmail)).size;

        return { total, verified, totalCo2e, totalRevenue, orgCount };
    }, [unifiedItems, userCount, entityFilter, actions.length, schools.length]);

    const handleStatusChange = async (item: UnifiedItem, newStatus: string) => {
        setUpdatingId(item.id);
        
        try {
            if (item.entityType === "school") {
                const idToken = await user?.getIdToken();
                const res = await fetch("/api/admin/verify-school", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        schoolId: item.id,
                        status: newStatus,
                        adminUid: user?.uid,
                        adminIdToken: idToken,
                    }),
                });
                if (!res.ok) throw new Error("Update failed");
                setSchools(prev => prev.map(s => s.id === item.id ? { ...s, status: newStatus as SchoolStatus } : s));
            } else {
                await updateActionStatus(item.id, newStatus as ActionStatus);
                setActions((prev) => prev.map((a) => (a.id === item.id ? { ...a, status: newStatus as ActionStatus } : a)));
            }

            toast.success(`Status updated to ${newStatus}`);
            if (user?.uid) syncPlatformStats(user.uid).catch(console.error);
        } catch {
            toast.error("Failed to update status.");
            const allActions = await getAllActions();
            setActions(allActions);
        } finally {
            setUpdatingId(null);
        }
    };

    const openVerifySchoolModal = async (school: School) => {
        setSelectedSchool(school);
        setIsSchoolEditMode(false);
        setVerifySchoolForm({
            schoolName: school.schoolName,
            address: school.address,
            baselineEnergyGrid: (school.baselineEnergyGrid || school.electricity_kWh_year)?.toString() || "",
            baselineEnergyDiesel: (school.baselineEnergyDiesel || 0).toString(),
            baselineEnergySolar: (school.baselineEnergySolar || 0).toString(),
            baselineWaterMunicipal: (school.baselineWaterMunicipal || school.water_consumption_m3)?.toString() || "",
            baselineWaterRain: (school.baselineWaterRain || 0).toString(),
            baselineWaterWaste: (school.baselineWaterWaste || 0).toString(),
            baselineWasteOrganic: (school.baselineWasteOrganic || school.waste_generated_kg)?.toString() || "",
            baselineWasteInorganic: (school.baselineWasteInorganic || 0).toString(),
            baselineWasteHazardous: (school.baselineWasteHazardous || 0).toString(),
            actionType: school.action_type || school.action_id || "Solar",
            actionQuantity: (school.actionQuantity || school.electricity_kWh_year || 0).toString(),
            students_count: (school.students_count || 1).toString(),
            status: "verified",
            adminNotes: school.adminNotes || "",
        });
        setVerifySchoolModalOpen(true);
    };

    const handleSchoolAdminVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSchool || !user) return;

        setVerifySubmitting(true);
        try {
            const idToken = await user.getIdToken();
            const res = await fetch("/api/admin/verify-school", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    schoolId: selectedSchool.id,
                    status: verifySchoolForm.status,
                    adminNotes: verifySchoolForm.adminNotes,
                    adminUid: user.uid,
                    adminIdToken: idToken,
                    editedData: isSchoolEditMode ? {
                        schoolName: verifySchoolForm.schoolName,
                        address: verifySchoolForm.address,
                        baselineEnergyGrid: Number(verifySchoolForm.baselineEnergyGrid) || 0,
                        baselineEnergyDiesel: Number(verifySchoolForm.baselineEnergyDiesel) || 0,
                        baselineEnergySolar: Number(verifySchoolForm.baselineEnergySolar) || 0,
                        baselineWaterMunicipal: Number(verifySchoolForm.baselineWaterMunicipal) || 0,
                        baselineWaterRain: Number(verifySchoolForm.baselineWaterRain) || 0,
                        baselineWaterWaste: Number(verifySchoolForm.baselineWaterWaste) || 0,
                        baselineWasteOrganic: Number(verifySchoolForm.baselineWasteOrganic) || 0,
                        baselineWasteInorganic: Number(verifySchoolForm.baselineWasteInorganic) || 0,
                        baselineWasteHazardous: Number(verifySchoolForm.baselineWasteHazardous) || 0,
                        students_count: Number(verifySchoolForm.students_count) || 1,
                        actionType: verifySchoolForm.actionType,
                        actionQuantity: Number(verifySchoolForm.actionQuantity) || 0,
                    } : null
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Verification failed");
            }

            toast.success(`School ${verifySchoolForm.status === "verified" ? "verified" : "rejected"} successfully!`);
            setVerifySchoolModalOpen(false);
            if (user?.uid) syncPlatformStats(user.uid).catch(console.error);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Verification failed");
        } finally {
            setVerifySubmitting(false);
        }
    };

    const openVerifyModal = async (action: Action) => {
        setSelectedAction(action);
        setIsEditMode(false);
        setValuesApproved(false);
        setUserPortfolio(null);
        setVerifyForm({
            co2eTonnes: action.co2eKg != null ? (action.co2eKg / 1000).toString() : "",
            atmanirbharPercent: action.atmanirbharPercent != null ? action.atmanirbharPercent.toString() : "",
            circularityPercent: action.circularityPercent != null ? action.circularityPercent.toString() : "",
            status: "verified",
            adminNotes: action.adminNotes || "",
            // Populate all baselines
            baselineEnergyGrid: (action.baselineEnergyGrid || 0).toString(),
            baselineEnergyDiesel: (action.baselineEnergyDiesel || 0).toString(),
            baselineEnergySolar: (action.baselineEnergySolar || 0).toString(),
            baselineWaterMunicipal: (action.baselineWaterMunicipal || 0).toString(),
            baselineWaterRain: (action.baselineWaterRain || 0).toString(),
            baselineWaterWaste: (action.baselineWaterWaste || 0).toString(),
            baselineWasteOrganic: (action.baselineWasteOrganic || 0).toString(),
            baselineWasteInorganic: (action.baselineWasteInorganic || 0).toString(),
            baselineWasteHazardous: (action.baselineWasteHazardous || 0).toString(),
            // Action Fields
            actionType: action.actionType,
            quantity: (action.quantity || 0).toString(),
            unit: action.unit || "",
            beneficiariesCount: (action.beneficiariesCount || 1).toString(),
        });
        setVerifyModalOpen(true);

        if (action.userId) {
            setFetchingPortfolio(true);
            try {
                const userActions = await getActionsByUserId(action.userId);
                if (userActions.length > 0) {
                    setUserPortfolio(calculatePortfolioMetrics(userActions));
                }
            } catch (err) {
                console.error("Error portfolio fetch:", err);
            } finally {
                setFetchingPortfolio(false);
            }
        }
    };

    const handleAdminVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAction || !user) return;

        if (verifyForm.status === "verified") {
            if (!verifyForm.co2eTonnes || !verifyForm.atmanirbharPercent) {
                // If not in state, recalculate now
                const impact = calculateImpactPhase2({
                    actionType: verifyForm.actionType,
                    quantity: Number(verifyForm.quantity) || 0,
                    unit: verifyForm.unit,
                    baselineEnergyGrid: Number(verifyForm.baselineEnergyGrid) || 0,
                    baselineEnergyDiesel: Number(verifyForm.baselineEnergyDiesel) || 0,
                    baselineEnergySolar: Number(verifyForm.baselineEnergySolar) || 0,
                    baselineWaterMunicipal: Number(verifyForm.baselineWaterMunicipal) || 0,
                    baselineWaterRain: Number(verifyForm.baselineWaterRain) || 0,
                    baselineWaterWaste: Number(verifyForm.baselineWaterWaste) || 0,
                    baselineWasteOrganic: Number(verifyForm.baselineWasteOrganic) || 0,
                    baselineWasteInorganic: Number(verifyForm.baselineWasteInorganic) || 0,
                    baselineWasteHazardous: Number(verifyForm.baselineWasteHazardous) || 0,
                    beneficiariesCount: Number(verifyForm.beneficiariesCount) || 1
                });
                
                if (impact.actionImpactTCO2e === 0 && verifyForm.status === "verified") {
                    // Safety check - if impact is 0 but we are trying to verify, it might be a missing input
                }
                
                // Assign to top level for API
                (verifyForm as any).calculatedCo2e = impact.actionImpactTCO2e;
                (verifyForm as any).calculatedAtmanirbhar = impact.atmanirbharScore;
                (verifyForm as any).calculatedCircularity = impact.circularityScore;
            }
        }

        setVerifySubmitting(true);
        try {
            const idToken = await user.getIdToken();
            
            // Recalculate one last time to be absolute sure we send the latest view to API
            const finalImpact = calculateImpactPhase2({
                actionType: verifyForm.actionType,
                quantity: Number(verifyForm.quantity) || 0,
                unit: verifyForm.unit,
                baselineEnergyGrid: Number(verifyForm.baselineEnergyGrid) || 0,
                baselineEnergyDiesel: Number(verifyForm.baselineEnergyDiesel) || 0,
                baselineEnergySolar: Number(verifyForm.baselineEnergySolar) || 0,
                baselineWaterMunicipal: Number(verifyForm.baselineWaterMunicipal) || 0,
                baselineWaterRain: Number(verifyForm.baselineWaterRain) || 0,
                baselineWaterWaste: Number(verifyForm.baselineWaterWaste) || 0,
                baselineWasteOrganic: Number(verifyForm.baselineWasteOrganic) || 0,
                baselineWasteInorganic: Number(verifyForm.baselineWasteInorganic) || 0,
                baselineWasteHazardous: Number(verifyForm.baselineWasteHazardous) || 0,
                beneficiariesCount: Number(verifyForm.beneficiariesCount) || 1
            });

            const res = await fetch("/api/admin/verify-action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    actionId: selectedAction.id,
                    status: verifyForm.status,
                    adminNotes: verifyForm.adminNotes,
                    adminUid: user.uid,
                    adminIdToken: idToken,
                    co2eTonnes: finalImpact.actionImpactTCO2e,
                    atmanirbharPercent: finalImpact.atmanirbharScore,
                    circularityPercent: finalImpact.circularityScore,
                    editedData: isEditMode ? {
                        baselineEnergyGrid: Number(verifyForm.baselineEnergyGrid) || 0,
                        baselineEnergyDiesel: Number(verifyForm.baselineEnergyDiesel) || 0,
                        baselineEnergySolar: Number(verifyForm.baselineEnergySolar) || 0,
                        baselineWaterMunicipal: Number(verifyForm.baselineWaterMunicipal) || 0,
                        baselineWaterRain: Number(verifyForm.baselineWaterRain) || 0,
                        baselineWaterWaste: Number(verifyForm.baselineWaterWaste) || 0,
                        baselineWasteOrganic: Number(verifyForm.baselineWasteOrganic) || 0,
                        baselineWasteInorganic: Number(verifyForm.baselineWasteInorganic) || 0,
                        baselineWasteHazardous: Number(verifyForm.baselineWasteHazardous) || 0,
                        actionType: verifyForm.actionType,
                        quantity: Number(verifyForm.quantity) || 0,
                        unit: verifyForm.unit,
                        beneficiariesCount: Number(verifyForm.beneficiariesCount) || 1
                    } : null
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Verification failed");
            }

            toast.success(`Action ${verifyForm.status === "verified" ? "verified" : "rejected"} successfully!`);
            setVerifyModalOpen(false);

            // Auto-sync stats in background after verification
            if (user?.uid) syncPlatformStats(user.uid).catch(console.error);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Verification failed");
        } finally {
            setVerifySubmitting(false);
        }
    };

    const handleExportCSV = () => {
        const headers = [
            "Entity Type",
            "Registry ID",
            "Action Type",
            "Actor Name",
            "Email",
            "CO2e (kg)",
            "Status",
            "Created At",
        ];

        const rows = unifiedItems.map((i) => [
            i.entityType,
            i.registryId || "",
            i.actionType,
            i.actorName,
            i.email,
            i.co2eKg.toFixed(3),
            i.status,
            i.createdAt?.toDate?.().toISOString() || "",
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ecf-registry-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const formatDate = (timestamp: Action["createdAt"]) => {
        if (!timestamp) return "N/A";
        // Handle Firestore Timestamp object
        const date = typeof timestamp === "string"
            ? new Date(timestamp)
            : timestamp?.toDate?.()
                ? timestamp.toDate()
                : null;
        if (!date || isNaN(date.getTime())) return "N/A";
        return date.toLocaleString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            timeZone: "Asia/Kolkata",
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 shadow-sm">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Actions</p>
                    <p className="text-3xl font-black text-gray-800 mt-1">{stats.total}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 shadow-sm">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Verified</p>
                    <p className="text-3xl font-black text-[#003527] mt-1">{stats.verified}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 shadow-sm">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total CO₂e</p>
                    <p className="text-3xl font-black text-[#003527] mt-1">{(stats.totalCo2e / 1000).toLocaleString("en-IN", { maximumFractionDigits: 3 })} <span className="text-sm font-bold text-gray-400">tCO₂e</span></p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 shadow-sm">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Organizations</p>
                    <p className="text-3xl font-black text-[#003527] mt-1">{stats.orgCount}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 shadow-sm">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Revenue</p>
                    <p className="text-3xl font-black text-gray-800 mt-1">₹{stats.totalRevenue.toLocaleString("en-IN")}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-3">
                    <CustomDropdown
                        size="md"
                        placeholder="All Entities"
                        value={entityFilter}
                        onChange={(val) => setEntityFilter(val as any)}
                        options={[
                            { value: "all", label: "All Entities" },
                            { value: "individual", label: "Individuals" },
                            { value: "school", label: "Schools" },
                        ]}
                        className="w-48"
                    />
                    <CustomDropdown
                        size="md"
                        placeholder="All Statuses"
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { value: "all", label: "All Statuses" },
                            ...ACTION_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
                            ...SCHOOL_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))
                        ].filter((v, i, a) => a.findIndex(t => t.value === v.value) === i)}
                        className="w-48"
                    />
                    <CustomDropdown
                        size="md"
                        placeholder="All Action Types"
                        value={typeFilter}
                        onChange={setTypeFilter}
                        options={[
                            { value: "all", label: "All Action Types" },
                            ...ACTION_TYPES.map((type) => ({ value: type.value, label: type.label }))
                        ]}
                        className="w-56"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#003527] text-white hover:bg-[rgb(22,28,100)] transition-colors text-sm font-bold shadow-sm"
                    >
                        <span>+ Register Action</span>
                    </Link>
                    <button
                        onClick={async () => {
                            if (!user?.uid) return;
                            const t = toast.loading("Syncing platform stats...");
                            try {
                                await syncPlatformStats(user.uid);
                                toast.update(t, { render: "Stats synced successfully!", type: "success", isLoading: false, autoClose: 3000 });
                            } catch (err) {
                                toast.update(t, { render: "Sync failed", type: "error", isLoading: false, autoClose: 3000 });
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-100 bg-transparent text-[#003527] hover:bg-green-50 transition-colors text-sm font-medium"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                        </svg>
                        Sync Dashboard
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-100 bg-transparent text-[#003527] hover:bg-[rgba(32,38,130,0.05)] transition-colors text-sm font-medium"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export CSV
                    </button>
                </div>
            </div>

            {unifiedItems.length === 0 ? (
                <div className="bg-white/50 border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                    <h3 className="text-gray-500 font-semibold text-lg">No entries found</h3>
                    <p className="text-gray-400 text-sm mt-1">
                        {statusFilter !== "all" || typeFilter !== "all" || entityFilter !== "all"
                            ? "Try changing your filters."
                            : "Entries will appear here once users submit them."}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
                    <div className="w-full overflow-x-auto rounded-lg">
                        <table className="min-w-[1000px] w-full">
                            <colgroup>
                                <col style={{ width: '110px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '160px' }} />
                                <col style={{ width: '140px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '180px' }} />
                                <col style={{ width: '110px' }} />
                                <col style={{ width: '130px' }} />
                                <col style={{ width: '150px' }} />
                            </colgroup>
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100/50">
                                    <th className="py-5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Registry ID</th>
                                    <th className="py-5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Entity</th>
                                    <th className="py-5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Action Type</th>
                                    <th className="py-5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actor</th>
                                    <th className="py-5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">CO₂e (kg)</th>
                                    <th className="py-5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="py-5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="py-5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="py-5 px-6 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {unifiedItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6 text-sm font-mono font-semibold text-[#003527]">
                                            {item.registryId ? (
                                                <a
                                                    href={`/verify/${item.registryId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline"
                                                >
                                                    {item.registryId}
                                                </a>
                                            ) : (
                                                <span className="text-gray-300">ECF-????</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${item.entityType === 'school' ? 'bg-orange-100 text-orange-600' : 'bg-[#b0f0d6] text-[#003527]'}`}>
                                                {item.entityType}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-medium text-gray-700">
                                            {item.actionType}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500">
                                            {item.actorName}
                                        </td>
                                        <td className="py-4 px-6 text-sm font-medium">
                                            <span className="text-gray-600">{item.co2eKg.toFixed(2)}</span>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-400">
                                            {item.email}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-400 whitespace-nowrap">
                                            {formatDate(item.createdAt)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <StatusBadge status={item.status as any} />
                                        </td>
                                        <td className="px-4 py-3 align-middle">
                                            {item.status === "pending" || item.status === "pledged" ? (
                                                <button
                                                    onClick={() => item.entityType === 'school' ? openVerifySchoolModal(item.originalData as School) : openVerifyModal(item.originalData as Action)}
                                                    className="w-full max-w-[120px] px-3 py-2 bg-[#003527] text-white text-xs font-bold rounded-lg hover:bg-[rgb(22,28,100)] transition-colors text-center block mx-auto outline-none"
                                                >
                                                    Verify
                                                </button>
                                            ) : (
                                                <div className="w-full max-w-[120px] mx-auto">
                                                    <CustomDropdown
                                                        size="sm"
                                                        value={item.status}
                                                        disabled={updatingId === item.id}
                                                        options={item.entityType === 'school' ? [
                                                            { value: "pledged", label: "Pledged" },
                                                            { value: "verified", label: "Verified" },
                                                            { value: "rejected", label: "Rejected" },
                                                        ] : [
                                                            { value: "pending", label: "Pending" },
                                                            { value: "verified", label: "Verified" },
                                                            { value: "rejected", label: "Rejected" },
                                                        ]}
                                                        onChange={(newStatus) => handleStatusChange(item, newStatus)}
                                                    />
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Individual Verification Modal - Overhauled */}
            {verifyModalOpen && selectedAction && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 px-4 py-6 overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-3xl">
                            <div>
                                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight italic">Verify Action (Individual)</h2>
                                <p className="text-sm font-medium text-gray-500 mt-0.5">{selectedAction.actorName} — {selectedAction.registryId}</p>
                            </div>
                            <button onClick={() => setVerifyModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleAdminVerification} className="p-6 overflow-y-auto space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Side: User Inputs (Step 1 & 2) */}
                                <div className="space-y-6">
                                    {/* Baseline Section (Step 1) */}
                                    <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-[#003527] p-2 rounded-lg text-white">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                                            </div>
                                            <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Step 1: Baseline Usage (Monthly)</h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {[
                                                { label: "Grid (kWh)", key: "baselineEnergyGrid" },
                                                { label: "Diesel (L)", key: "baselineEnergyDiesel" },
                                                { label: "Solar (kWh)", key: "baselineEnergySolar" },
                                                { label: "Water (L)", key: "baselineWaterMunicipal" },
                                                { label: "Rain (L)", key: "baselineWaterRain" },
                                                { label: "Waste (L)", key: "baselineWaterWaste" },
                                                { label: "Org (kg)", key: "baselineWasteOrganic" },
                                                { label: "Inorg (kg)", key: "baselineWasteInorganic" },
                                                { label: "Haz (kg)", key: "baselineWasteHazardous" }
                                            ].map((field) => (
                                                <div key={field.key} className="space-y-1">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{field.label}</label>
                                                    <input
                                                        type="number"
                                                        value={verifyForm[field.key as keyof typeof verifyForm]}
                                                        readOnly={!isEditMode}
                                                        onChange={(e) => setVerifyForm(f => ({ ...f, [field.key]: e.target.value }))}
                                                        className={`w-full px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all text-slate-900 ${isEditMode ? 'border-[#b0f0d6] bg-white focus:border-blue-600 outline-none' : 'border-transparent bg-transparent'}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Section (Step 2) */}
                                    <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-[#003527] p-2 rounded-lg text-white">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                                            </div>
                                            <h3 className="font-black text-blue-800 uppercase tracking-wider text-sm">Step 2: Carbon Action</h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest px-1">Action Type</label>
                                                <select
                                                    disabled={!isEditMode}
                                                    value={verifyForm.actionType}
                                                    onChange={(e) => setVerifyForm(f => ({ ...f, actionType: e.target.value }))}
                                                    className={`w-full px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all text-slate-900 ${isEditMode ? 'border-[#b0f0d6] bg-white focus:border-blue-600 outline-none' : 'border-transparent bg-transparent cursor-default'}`}
                                                >
                                                    {ACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest px-1">Quantity</label>
                                                    <input
                                                        type="number"
                                                        value={verifyForm.quantity}
                                                        readOnly={!isEditMode}
                                                        onChange={(e) => setVerifyForm(f => ({ ...f, quantity: e.target.value }))}
                                                        className={`w-full px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all text-slate-900 ${isEditMode ? 'border-[#b0f0d6] bg-white focus:border-blue-600 outline-none' : 'border-transparent bg-transparent'}`}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest px-1">Unit</label>
                                                    <input
                                                        type="text"
                                                        value={verifyForm.unit}
                                                        readOnly={!isEditMode}
                                                        onChange={(e) => setVerifyForm(f => ({ ...f, unit: e.target.value }))}
                                                        className={`w-full px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all text-slate-900 ${isEditMode ? 'border-[#b0f0d6] bg-white focus:border-blue-600 outline-none' : 'border-transparent bg-transparent'}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditMode(!isEditMode)}
                                            className={`flex-1 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${isEditMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                            {isEditMode ? "Lock Values" : "Edit Inputs"}
                                        </button>
                                    </div>
                                </div>

                                {/* Right Side: Results Header & Calculations */}
                                <div className="space-y-6">
                                    <div className="bg-[#003527] rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                                        <div className="relative z-10 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-black uppercase tracking-widest text-xs opacity-80">Impact Performance</h3>
                                                <div className="bg-white/20 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">Live Audit Mode</div>
                                            </div>

                                            {(() => {
                                                const res = calculateImpactPhase2({
                                                    actionType: verifyForm.actionType,
                                                    quantity: Number(verifyForm.quantity) || 0,
                                                    unit: verifyForm.unit,
                                                    baselineEnergyGrid: Number(verifyForm.baselineEnergyGrid) || 0,
                                                    baselineEnergyDiesel: Number(verifyForm.baselineEnergyDiesel) || 0,
                                                    baselineEnergySolar: Number(verifyForm.baselineEnergySolar) || 0,
                                                    baselineWaterMunicipal: Number(verifyForm.baselineWaterMunicipal) || 0,
                                                    baselineWaterRain: Number(verifyForm.baselineWaterRain) || 0,
                                                    baselineWaterWaste: Number(verifyForm.baselineWaterWaste) || 0,
                                                    baselineWasteOrganic: Number(verifyForm.baselineWasteOrganic) || 0,
                                                    baselineWasteInorganic: Number(verifyForm.baselineWasteInorganic) || 0,
                                                    baselineWasteHazardous: Number(verifyForm.baselineWasteHazardous) || 0,
                                                    beneficiariesCount: Number(verifyForm.beneficiariesCount) || 1
                                                });
                                                return (
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-1">
                                                            <div className="text-4xl font-black">{res.actionImpactTCO2e.toFixed(3)}</div>
                                                            <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest">tCO2e Reduced / yr</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-4xl font-black">{res.atmanirbharScore.toFixed(1)}%</div>
                                                            <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Atmanirbhar Score</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-lg font-black opacity-80 underline decoration-indigo-300 underline-offset-4 decoration-2">{res.tCO2e.toFixed(3)} tCO2e</div>
                                                            <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Annual Baseline Footprint</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-lg font-black">{res.circularityScore.toFixed(1)}%</div>
                                                            <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Circularity %</div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-6 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Final Status</label>
                                                <select
                                                    value={verifyForm.status}
                                                    onChange={(e) => setVerifyForm(f => ({ ...f, status: e.target.value as ActionStatus }))}
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm font-bold focus:border-[#003527] transition-all outline-none"
                                                >
                                                    <option value="verified">Verified</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Admin Notes (Internal)</label>
                                                <input
                                                    type="text"
                                                    value={verifyForm.adminNotes}
                                                    onChange={(e) => setVerifyForm(f => ({ ...f, adminNotes: e.target.value }))}
                                                    placeholder="Reason for rejection or verification notes..."
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm font-bold focus:border-[#003527] outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setVerifyModalOpen(false)}
                                                className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-100 bg-white text-sm font-black text-gray-400 hover:bg-gray-50 transition-all uppercase tracking-widest"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={verifySubmitting}
                                                className="flex-[2] px-6 py-4 rounded-2xl bg-[#003527] text-white text-sm font-black shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest disabled:opacity-50"
                                            >
                                                {verifySubmitting ? "Syncing..." : "Submit Verification"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* School Verification Modal */}
            {/* School Verification Modal - Overhauled */}
            {verifySchoolModalOpen && selectedSchool && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 px-4 py-6 overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-orange-50/50 rounded-t-3xl">
                            <div>
                                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight italic">Verify School Action</h2>
                                <p className="text-sm font-medium text-gray-500 mt-0.5">{selectedSchool.schoolName} — {selectedSchool.registryId}</p>
                            </div>
                            <button onClick={() => setVerifySchoolModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSchoolAdminVerification} className="p-6 overflow-y-auto space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Side: Step 1 Baselines */}
                                <div className="space-y-6">
                                    <div className="bg-orange-50/30 rounded-2xl p-5 border border-orange-100 space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-orange-500 p-2 rounded-lg text-white">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                                            </div>
                                            <h3 className="font-black text-orange-800 uppercase tracking-wider text-sm">Step 1: Baseline Metrics (Annual)</h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {[
                                                { label: "Grid (kWh)", key: "baselineEnergyGrid", color: "orange" },
                                                { label: "Diesel (L)", key: "baselineEnergyDiesel", color: "orange" },
                                                { label: "Solar (kWh)", key: "baselineEnergySolar", color: "orange" },
                                                { label: "Water (m³)", key: "baselineWaterMunicipal", color: "blue" },
                                                { label: "Rain (m³)", key: "baselineWaterRain", color: "blue" },
                                                { label: "Waste (m³)", key: "baselineWaterWaste", color: "blue" },
                                                { label: "Organic (kg)", key: "baselineWasteOrganic", color: "emerald" },
                                                { label: "Inorg (kg)", key: "baselineWasteInorganic", color: "emerald" },
                                                { label: "Haz (kg)", key: "baselineWasteHazardous", color: "emerald" }
                                            ].map((field) => (
                                                <div key={field.key} className="space-y-1">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">{field.label}</label>
                                                    <input
                                                        type="number"
                                                        value={verifySchoolForm[field.key as keyof typeof verifySchoolForm]}
                                                        readOnly={!isSchoolEditMode}
                                                        onChange={(e) => setVerifySchoolForm(f => ({ ...f, [field.key]: e.target.value }))}
                                                        className={`w-full px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all text-slate-900 ${isSchoolEditMode ? 'border-orange-200 bg-white focus:border-orange-600 outline-none' : 'border-transparent bg-transparent'}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* School Context & Action */}
                                    <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100 space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-[#003527] p-2 rounded-lg text-white">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5"/></svg>
                                            </div>
                                            <h3 className="font-black text-indigo-800 uppercase tracking-wider text-sm">Step 2: School Action & Details</h3>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest px-1">School Name</label>
                                                <input
                                                    type="text"
                                                    value={verifySchoolForm.schoolName}
                                                    readOnly={!isSchoolEditMode}
                                                    onChange={(e) => setVerifySchoolForm(f => ({ ...f, schoolName: e.target.value }))}
                                                    className={`w-full px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all text-slate-900 ${isSchoolEditMode ? 'border-indigo-200 bg-white focus:border-indigo-500 outline-none' : 'border-transparent bg-transparent'}`}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest px-1">Action Qty</label>
                                                    <input
                                                        type="number"
                                                        value={verifySchoolForm.actionQuantity}
                                                        readOnly={!isSchoolEditMode}
                                                        onChange={(e) => setVerifySchoolForm(f => ({ ...f, actionQuantity: e.target.value }))}
                                                        className={`w-full px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all text-slate-900 ${isSchoolEditMode ? 'border-indigo-200 bg-white focus:border-indigo-500 outline-none' : 'border-transparent bg-transparent'}`}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest px-1">Students Count</label>
                                                    <input
                                                        type="number"
                                                        value={verifySchoolForm.students_count}
                                                        readOnly={!isSchoolEditMode}
                                                        onChange={(e) => setVerifySchoolForm(f => ({ ...f, students_count: e.target.value }))}
                                                        className={`w-full px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all text-slate-900 ${isSchoolEditMode ? 'border-indigo-200 bg-white focus:border-indigo-500 outline-none' : 'border-transparent bg-transparent'}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setIsSchoolEditMode(!isSchoolEditMode)}
                                        className={`w-full px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${isSchoolEditMode ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                        {isSchoolEditMode ? "Lock Values" : "Edit Detailed Inputs"}
                                    </button>
                                </div>

                                {/* Right Side: Results & Final Decision */}
                                <div className="space-y-6">
                                    <div className="bg-[#003527] rounded-[2rem] p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                                        <div className="relative z-10 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-black uppercase tracking-widest text-xs opacity-80">Calculated School Impact</h3>
                                                <div className="bg-white/20 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">Live Audit Mode</div>
                                            </div>

                                            {(() => {
                                                const impact = calculateSchoolImpact({
                                                    baselineEnergyGrid: Number(verifySchoolForm.baselineEnergyGrid) || 0,
                                                    baselineEnergyDiesel: Number(verifySchoolForm.baselineEnergyDiesel) || 0,
                                                    baselineEnergySolar: Number(verifySchoolForm.baselineEnergySolar) || 0,
                                                    baselineWaterMunicipal: Number(verifySchoolForm.baselineWaterMunicipal) || 0,
                                                    baselineWaterRain: Number(verifySchoolForm.baselineWaterRain) || 0,
                                                    baselineWaterWaste: Number(verifySchoolForm.baselineWaterWaste) || 0,
                                                    baselineWasteOrganic: Number(verifySchoolForm.baselineWasteOrganic) || 0,
                                                    baselineWasteInorganic: Number(verifySchoolForm.baselineWasteInorganic) || 0,
                                                    baselineWasteHazardous: Number(verifySchoolForm.baselineWasteHazardous) || 0,
                                                    students_count: Number(verifySchoolForm.students_count) || 1,
                                                });
                                                return (
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-1">
                                                            <div className="text-4xl font-black">{impact.tco2e_annual.toFixed(1)}</div>
                                                            <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest">tCO2e Savings / yr</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-4xl font-black">{impact.atmanirbhar_pct.toFixed(0)}%</div>
                                                            <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Atmanirbhar Score</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-lg font-black opacity-80 underline decoration-blue-300 underline-offset-4 decoration-2">{impact.carbon_intensity.toFixed(2)}</div>
                                                            <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest">tCO2e / Student</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-lg font-black">{impact.circularity_pct.toFixed(0)}%</div>
                                                            <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Circularity %</div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-6 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Final Status</label>
                                                <select
                                                    value={verifySchoolForm.status}
                                                    onChange={(e) => setVerifySchoolForm(f => ({ ...f, status: e.target.value as SchoolStatus }))}
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm font-bold focus:border-[#003527] transition-all outline-none"
                                                >
                                                    <option value="verified">Verified</option>
                                                    <option value="rejected">Rejected</option>
                                                    <option value="pledged">Pledged</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Admin Notes</label>
                                                <input
                                                    type="text"
                                                    value={verifySchoolForm.adminNotes}
                                                    onChange={(e) => setVerifySchoolForm(f => ({ ...f, adminNotes: e.target.value }))}
                                                    placeholder="Reason for decision..."
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm font-bold focus:border-[#003527] outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setVerifySchoolModalOpen(false)}
                                                className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-100 bg-white text-sm font-black text-gray-400 hover:bg-gray-50 transition-all uppercase tracking-widest"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={verifySubmitting}
                                                className="flex-[2] px-6 py-4 rounded-2xl bg-[#003527] text-white text-sm font-black shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest disabled:opacity-50"
                                            >
                                                {verifySubmitting ? "Syncing..." : "Submit Verification"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
