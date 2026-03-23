"use client";

import React from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";

export default function ActionTypeCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Link href="/register/action" className="group">
                <Card className="h-full hover:shadow-2xl hover:border-blue-200 transition-all duration-300 cursor-pointer overflow-hidden border-2 border-transparent">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                            🌍
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Climate Action</h2>
                            <p className="text-gray-500 leading-relaxed font-medium">
                                Standard registry for energy, water, and waste reduction actions. Perfect for individual and corporate impact tracking.
                            </p>
                        </div>
                        <div className="flex items-center text-[rgb(32,38,130)] font-bold gap-2 group-hover:gap-3 transition-all pt-4 border-t border-gray-50">
                            Continue to Form <span>→</span>
                        </div>
                    </div>
                </Card>
            </Link>

            <Link href="/school-register" className="group">
                <Card className="h-full hover:shadow-2xl hover:border-green-200 transition-all duration-300 cursor-pointer overflow-hidden border-2 border-transparent">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                            🏫
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">School Action</h2>
                            <p className="text-gray-500 leading-relaxed font-medium">
                                Specialized module for educational institutions. Track campus-wide sustainability and engage students in climate goals.
                            </p>
                        </div>
                        <div className="flex items-center text-green-600 font-bold gap-2 group-hover:gap-3 transition-all pt-4 border-t border-gray-50">
                            Continue to Form <span>→</span>
                        </div>
                    </div>
                </Card>
            </Link>
        </div>
    );
}
