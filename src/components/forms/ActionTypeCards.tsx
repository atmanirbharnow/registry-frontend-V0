"use client";

import React from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";

export default function ActionTypeCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Individuals */}
            <Link href="/register/action" className="group h-full">
                <Card className="h-full hover:shadow-2xl hover:border-blue-200 transition-all duration-300 cursor-pointer overflow-hidden border-2 border-transparent p-6">
                    <div className="flex flex-col h-full">
                        <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 mb-6">
                            👤
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-800 mb-3 leading-tight">Individuals</h2>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                Registry for lifestyle actions like household energy, waste reduction, and personal mobility impact tracking.
                            </p>
                        </div>
                        <div className="flex items-center text-[rgb(32,38,130)] text-sm font-bold gap-2 group-hover:gap-3 transition-all pt-6 mt-6 border-t border-gray-50 uppercase tracking-wider">
                            Continue <span>→</span>
                        </div>
                    </div>
                </Card>
            </Link>

            {/* Schools / Education Institutes */}
            <Link href="/school-register" className="group h-full">
                <Card className="h-full hover:shadow-2xl hover:border-green-200 transition-all duration-300 cursor-pointer overflow-hidden border-2 border-transparent p-6">
                    <div className="flex flex-col h-full">
                        <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 mb-6">
                            🏫
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-800 mb-3 leading-tight">Schools/Education Institutes</h2>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                Holistic sustainability tracking for campuses. Engage students and staff in climate goal synchronization.
                            </p>
                        </div>
                        <div className="flex items-center text-green-600 text-sm font-bold gap-2 group-hover:gap-3 transition-all pt-6 mt-6 border-t border-gray-50 uppercase tracking-wider">
                            Continue <span>→</span>
                        </div>
                    </div>
                </Card>
            </Link>

            {/* Hospitals and Hotels (Inactive) */}
            <div className="h-full opacity-60 grayscale-[0.5]">
                <Card className="h-full border-2 border-dashed border-gray-200 p-6 flex flex-col">
                    <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center text-2xl mb-6">
                        🏨
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <h2 className="text-xl font-bold text-gray-400 leading-tight">Hospitals and Hotels</h2>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed font-medium italic">
                            Specialized environmental registry for the hospitality and healthcare sector. (Coming Soon)
                        </p>
                    </div>
                    <div className="text-gray-300 text-[10px] font-bold uppercase tracking-widest pt-6 mt-6 border-t border-gray-50">
                        Module Inactive
                    </div>
                </Card>
            </div>

            {/* SME (Inactive) */}
            <div className="h-full opacity-60 grayscale-[0.5]">
                <Card className="h-full border-2 border-dashed border-gray-200 p-6 flex flex-col">
                    <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-2xl mb-6">
                        🏢
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <h2 className="text-xl font-bold text-gray-400 leading-tight">SME</h2>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed font-medium italic">
                            Carbon footprinting and reduction roadmaps for Small and Medium Enterprises. (Coming Soon)
                        </p>
                    </div>
                    <div className="text-gray-300 text-[10px] font-bold uppercase tracking-widest pt-6 mt-6 border-t border-gray-50">
                        Module Inactive
                    </div>
                </Card>
            </div>
        </div>
    );
}
