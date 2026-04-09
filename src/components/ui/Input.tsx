"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    textarea?: boolean;
}

const Input = React.forwardRef<HTMLInputElement & HTMLTextAreaElement, InputProps>(
    ({ label, error, helperText, className = "", id, textarea, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

        const commonClasses = `
            w-full px-3 py-2 rounded-lg border bg-white
            focus:bg-white transition-all duration-200 outline-none
            font-medium text-gray-700 placeholder:text-gray-300
            disabled:bg-gray-50/80 disabled:text-gray-800 disabled:cursor-not-allowed disabled:opacity-100
            ${error ? "border-red-400 focus:border-red-400" : "border-slate-300 focus:border-[#003527]"}
            ${className}
        `;

        return (
            <div className="space-y-2">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-[11px] font-black text-gray-500 uppercase tracking-wider ml-1"
                    >
                        {label}
                    </label>
                )}
                {textarea ? (
                    <textarea
                        ref={ref as any}
                        id={inputId}
                        className={`${commonClasses} min-h-[100px] resize-y`}
                        {...(props as any)}
                    />
                ) : (
                    <input
                        ref={ref as any}
                        id={inputId}
                        className={commonClasses}
                        {...(props as any)}
                    />
                )}
                {error && <p className="text-red-500 text-xs ml-1">{error}</p>}
                {helperText && !error && (
                    <p className="text-gray-400 text-xs ml-1">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
export default Input;
