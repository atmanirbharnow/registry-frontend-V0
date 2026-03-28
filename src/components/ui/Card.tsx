"use client";

import React from "react";

interface CardProps {
    header?: React.ReactNode;
    footer?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export default function Card({
    header,
    footer,
    children,
    className = "",
    noPadding = false,
}: CardProps) {
    return (
        <div
            className={`
        bg-white rounded-3xl border border-gray-100
        shadow-[0_8px_30px_rgb(0,0,0,0.04)]
        ${className}
      `}
        >
            {header && (
                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                    {header}
                </div>
            )}
            <div className={noPadding ? "" : "px-6 py-6"}>{children}</div>
            {footer && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
                    {footer}
                </div>
            )}
        </div>
    );
}
