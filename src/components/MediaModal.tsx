"use client";

import React, { useState } from "react";
import Modal from "./ui/Modal";
import { Action } from "@/types/action";
import { School } from "@/types/school";
import { ACTION_PHOTO_LABELS } from "@/lib/constants";

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Action | School | null;
}

export default function MediaModal({ isOpen, onClose, item }: MediaModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!item) return null;

  const isSchool = "schoolName" in item;
  const images: { url: string; label: string }[] = [];
  const itemAsAny = item as any;
  const processedUrls = new Set<string>();

  const addImage = (url: string, label: string) => {
    if (url && typeof url === "string" && (url.startsWith("http") || url.startsWith("data:image")) && !processedUrls.has(url)) {
      images.push({ url, label: label || "Uploaded Document" });
      processedUrls.add(url);
    }
  };

  // 1. Explicit priority fields with known labels
  const priorityFields: Record<string, string> = {
    energyBillCopy: "Energy Bill Copy",
    meterPhoto: "Meter Photo",
    moreDetailsPhoto: "More Details",
    siteOverviewPhoto: "Site Overview",
    verificationPhoto: "Verification Photo",
    photo_url: "Proof Photo",
    photoUrl: "Proof Photo",
    sitePhoto: "Site Photo",
    ...ACTION_PHOTO_LABELS
  };

  Object.entries(priorityFields).forEach(([key, label]) => {
    addImage(itemAsAny[key], label);
  });

  // 2. Handle known arrays
  if (Array.isArray(itemAsAny.meterPhotos)) {
    itemAsAny.meterPhotos.forEach((url: string, i: number) => addImage(url, `Meter Photo ${i + 1}`));
  }

  // 3. AGGRESSIVE SCAVENGER: Scan all keys for anything that looks like a URL
  // This catches any inconsistently named fields or new fields added in the future
  Object.keys(itemAsAny).forEach(key => {
    const val = itemAsAny[key];
    if (typeof val === "string" && (val.startsWith("http") || val.startsWith("data:image"))) {
      if (!processedUrls.has(val)) {
        // Find a readable label for the scavenged field
        let displayLabel = key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
        displayLabel = displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1);
        addImage(val, displayLabel);
      }
    }
  });

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Media/Documents"
        maxWidth="max-w-4xl"
        zIndex="z-[1200]"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No documents uploaded for this action.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {images.map((img, idx) => (
                <div key={idx} className="space-y-2 group">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#003527] opacity-60">
                      {img.label}
                    </span>
                    <a 
                      href={img.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Open Original
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                      </svg>
                    </a>
                  </div>
                  <div 
                    onClick={() => setPreviewUrl(img.url)}
                    className="relative aspect-video rounded-xl bg-gray-50 border-2 border-gray-100 overflow-hidden shadow-sm transition-all group-hover:shadow-md group-hover:border-[#b0f0d6] cursor-zoom-in"
                  >
                    <img
                      src={img.url}
                      alt={img.label}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                        <div className="bg-white/90 p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                             </svg>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg bg-[#003527] text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-green-900/10 hover:scale-[1.02] transition-all active:scale-[0.98]"
          >
            Close Viewer
          </button>
        </div>
      </Modal>

      {/* Full-screen Preview Section */}
      {previewUrl && (
        <div 
          className="fixed inset-0 z-[1300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewUrl(null)}
        >
          <button 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
            onClick={() => setPreviewUrl(null)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          
          <img 
            src={previewUrl} 
            alt="Full view" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/40 text-white/80 text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-sm">
            Click anywhere outside to close
          </div>
        </div>
      )}
    </>
  );
}
