"use client";

import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#003527] text-white border-[#003527] hover:bg-[#002219] hover:-translate-y-0.5 shadow-sm",
  secondary:
    "bg-white text-[#003527] border-[#003527] hover:bg-[#f0f3ee]",
  danger:
    "bg-red-500 text-white border-red-500 hover:bg-red-600 shadow-lg shadow-red-200",
  ghost:
    "bg-transparent text-gray-600 border-transparent hover:bg-[#f0f3ee]",
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: "py-1.5 px-3 text-xs rounded-lg",
    md: "py-2 px-4 text-xs rounded-lg",
    lg: "py-2.5 px-5 text-sm rounded-lg",
};

export default function Button({
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    children,
    className = "",
    ...props
}: ButtonProps) {
    return (
        <button
            disabled={disabled || loading}
            className={`
        inline-flex items-center justify-center gap-2
        font-semibold border
        transition-all duration-200 active:scale-[0.98]
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
            {...props}
        >
            {loading && (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-lg animate-spin" />
            )}
            {children}
        </button>
    );
}
