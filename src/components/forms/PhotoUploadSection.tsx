"use client";

import React, { useRef, useState } from "react";
import Spinner from "../ui/Spinner";

interface PhotoUploadSectionProps {
    meterPhotos: string[];
    sitePhoto: string | null;
    userId: string;
    onMeterPhotosChange: (urls: string[]) => void;
    onSitePhotoChange: (url: string | null) => void;
}

async function uploadViaProxy(file: File, path: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);

    const response = await fetch("/api/storage-proxy", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Upload failed");
    }

    const data = await response.json();
    return data.url;
}

export default function PhotoUploadSection({
    meterPhotos,
    sitePhoto,
    userId,
    onMeterPhotosChange,
    onSitePhotoChange,
}: PhotoUploadSectionProps) {
    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const meterRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];
    const siteRef = useRef<HTMLInputElement>(null);

    const handleMeterUpload = async (index: number, file: File) => {
        const key = `meter-${index}`;
        setUploading((prev) => ({ ...prev, [key]: true }));
        try {
            const path = `actions/${userId}/meter-${index}-${Date.now()}-${file.name}`;
            const url = await uploadViaProxy(file, path);
            const updated = [...meterPhotos];
            updated[index] = url;
            onMeterPhotosChange(updated);
        } catch {
            // upload failed silently — UI shows no thumbnail
        } finally {
            setUploading((prev) => ({ ...prev, [key]: false }));
        }
    };

    const handleSiteUpload = async (file: File) => {
        setUploading((prev) => ({ ...prev, site: true }));
        try {
            const path = `actions/${userId}/site-${Date.now()}-${file.name}`;
            const url = await uploadViaProxy(file, path);
            onSitePhotoChange(url);
        } catch {
            // upload failed silently
        } finally {
            setUploading((prev) => ({ ...prev, site: false }));
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                Photos
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[0, 1, 2].map((index) => (
                    <div key={index} className="space-y-1">
                        <span className="text-xs text-gray-500 font-medium ml-1">
                            Meter Photo {index + 1}
                        </span>
                        <div
                            onClick={() => meterRefs[index]?.current?.click()}
                            className="relative flex items-center justify-center h-28 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer overflow-hidden"
                        >
                            {uploading[`meter-${index}`] ? (
                                <Spinner size="sm" />
                            ) : meterPhotos[index] ? (
                                <img
                                    src={meterPhotos[index]}
                                    alt={`Meter ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-400 text-xs">+ Upload</span>
                            )}
                        </div>
                        <input
                            ref={meterRefs[index]}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleMeterUpload(index, file);
                            }}
                        />
                    </div>
                ))}
            </div>

            <div className="space-y-1">
                <span className="text-xs text-gray-500 font-medium ml-1">
                    Site Photo
                </span>
                <div
                    onClick={() => siteRef.current?.click()}
                    className="relative flex items-center justify-center h-28 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer overflow-hidden max-w-[200px]"
                >
                    {uploading.site ? (
                        <Spinner size="sm" />
                    ) : sitePhoto ? (
                        <img
                            src={sitePhoto}
                            alt="Site"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-gray-400 text-xs">+ Upload</span>
                    )}
                </div>
                <input
                    ref={siteRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleSiteUpload(file);
                    }}
                />
            </div>
        </div>
    );
}
