"use client";

import React from "react";
import { APP_URL } from "@/lib/constants";

interface QRCodeProps {
    registryId: string;
    size?: number;
    type?: 'action' | 'school';
}

export default function QRCode({ registryId, size = 150, type = 'action' }: QRCodeProps) {
    const verifyUrl = `${APP_URL}/verify/${registryId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(verifyUrl)}`;

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                <img
                    src={qrUrl}
                    alt={`QR Code for ${registryId}`}
                    width={size}
                    height={size}
                    className="block"
                />
            </div>
            <a
                href={qrUrl}
                download={`${registryId}-qr.png`}
                className="text-xs font-semibold text-[#003527] hover:underline cursor-pointer"
            >
                Download QR Code
            </a>
        </div>
    );
}
