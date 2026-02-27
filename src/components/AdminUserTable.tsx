"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Spinner from "./ui/Spinner";
import { UserProfile } from "@/types/user";
import { getAllUsers } from "@/lib/firestoreService";

export default function AdminUserTable() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        try {
            const data = await getAllUsers();
            data.sort((a, b) => {
                const timeA = a.createdAt?.toMillis?.() || 0;
                const timeB = b.createdAt?.toMillis?.() || 0;
                return timeB - timeA;
            });
            setUsers(data);
        } catch {
            toast.error("Failed to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const formatDate = (timestamp: UserProfile["createdAt"]) => {
        if (!timestamp?.toDate) return "N/A";
        return timestamp.toDate().toLocaleString("en-IN", {
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

    if (users.length === 0) {
        return (
            <div className="bg-white/50 border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                <h3 className="text-gray-500 font-semibold text-lg">No users found</h3>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100/50">
                            <th className="py-5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="py-5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                            <th className="py-5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                            <th className="py-5 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Joined Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map((user) => (
                            <tr key={user.uid} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-6 text-sm font-semibold text-gray-800">
                                    {user.displayName || "Unknown"}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-600">
                                    {user.email || "—"}
                                </td>
                                <td className="py-4 px-6 text-sm">
                                    <span
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.role === "admin"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {user.role || "user"}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-400 whitespace-nowrap">
                                    {formatDate(user.createdAt)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
