"use client";

import React, { useState, useRef, useEffect } from "react";

export interface DropdownOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface MultiSelectDropdownProps {
    options: readonly DropdownOption[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
}

const sizeClasses = {
    sm: "px-3 py-2 text-xs rounded-lg",
    md: "px-4 py-2.5 text-sm rounded-xl",
    lg: "px-5 py-4 text-base rounded-xl",
};

export default function MultiSelectDropdown({
    options,
    selectedValues,
    onChange,
    placeholder = "Select options",
    className = "",
    disabled = false,
    size = "md",
}: MultiSelectDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    const toggleOption = (value: string) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter((v) => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    const displayText = selectedValues.length > 0
        ? `${selectedValues.length} action${selectedValues.length > 1 ? 's' : ''} selected`
        : placeholder;

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <button
                type="button"
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                className={`
                    flex items-center justify-between w-full
                    border border-slate-300 bg-white hover:border-blue-400 focus:border-blue-500
                    transition-all duration-200 outline-none font-medium
                    ${sizeClasses[size]}
                    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
            >
                <span className={`truncate mr-2 ${selectedValues.length > 0 ? "text-[rgb(32,38,130)] font-bold" : "text-gray-400"}`}>
                    {displayText}
                </span>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-gray-500 flex-shrink-0 transition-transform duration-150 ${isOpen ? "rotate-180" : "rotate-0"}`}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {isOpen && (
                <div
                    role="listbox"
                    className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 shadow-lg rounded-xl max-h-60 overflow-y-auto"
                >
                    <div className="py-1">
                        {options.map((option) => {
                            const isSelected = selectedValues.includes(option.value);
                            return (
                                <div
                                    key={option.value}
                                    role="option"
                                    aria-selected={isSelected}
                                    aria-disabled={option.disabled}
                                    onClick={(e) => {
                                        if (option.disabled) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            return;
                                        }
                                        toggleOption(option.value);
                                    }}
                                    className={`
                                        px-4 py-2.5 flex items-center gap-3
                                        transition-colors duration-150
                                        ${option.disabled ? "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400" : "cursor-pointer hover:bg-gray-50 text-gray-700"}
                                        ${isSelected && !option.disabled ? "bg-blue-50/10" : ""}
                                        ${size === "sm" ? "text-xs px-3 py-2" : size === "lg" ? "text-base px-5" : "text-sm"}
                                    `}
                                >
                                    <div className={`w-5 h-5 flex-shrink-0 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[rgb(32,38,130)] border-[rgb(32,38,130)]' : 'border-gray-300 bg-white'}`}>
                                        {isSelected && (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className={`truncate flex items-center gap-2 ${isSelected ? 'font-semibold text-[rgb(32,38,130)]' : ''}`}>
                                        {option.label}
                                        {option.disabled && <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded-md bg-white">Registered</span>}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
