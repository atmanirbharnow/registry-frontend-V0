"use client";

import React from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-[#112000]",
    danger: "bg-red-100 text-red-700",
    info: "bg-[#b0f0d6] text-[#003527]",
};

export default function Badge({
    variant = "default",
    children,
    className = "",
}: BadgeProps) {
    return (
        <span
            className={`
        inline-flex items-center px-3 py-1.5
        text-xs font-medium rounded-lg
        ${variantClasses[variant]}
        ${className}
      `}
        >
            {children}
        </span>
    );
}
