"use client";
import React from "react";

export default function VerificationSection() {
  return (
    <section id="verification" className="py-12 md:py-32 bg-[#f1f5f9] px-4 md:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Side: Content */}
        <div className="lg:col-span-7 flex flex-col items-start gap-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#414942]">
            Transparent by Design
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-[rgb(32,38,130)] leading-tight">
            Every Action Is <br /> Publicly Verifiable
          </h2>
          <div className="space-y-6 text-[#414942] text-lg font-medium leading-relaxed max-w-2xl">
            <p>
              When you register an action, it gets a unique Registry ID (ECF-XXXX) and a 
              SHA-256 digital signature. The signature is generated from your submission data 
              — if anything changes, the hash changes too.
            </p>
            <p>
              Our admin team reviews your submission, verifies your proof photos, and 
              approves the calculated impact values. Once verified, your public certificate 
              is live forever at <span className="text-[rgb(32,38,130)] underline">climateassetregistry.org/verify/[ID]</span>.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 mt-4">
            {[
              "SHA-256 hash for tamper detection",
              "QR code linking to public verification page",
              "Admin-reviewed before final verification"
            ].map((point) => (
              <div key={point} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-[#bfdbfe] text-[rgb(32,38,130)] rounded-full flex items-center justify-center text-xs">
                  ✓
                </span>
                <span className="text-sm font-bold text-[rgb(32,38,130)]">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Mockup Card */}
        <div className="lg:col-span-5 flex justify-center items-center relative">
          {/* Subtle Glow */}
          <div className="absolute -inset-10 bg-[#bfdbfe] opacity-20 blur-[100px] rounded-full" />
          
          <div className="relative bg-white border-2 border-[rgb(32,38,130)] rounded-[2.5rem] p-8 md:p-10 shadow-2xl max-w-sm w-full group">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="flex flex-col gap-1 items-center">
                <span className="text-[10px] font-black text-[rgb(32,38,130)] tracking-[0.3em] uppercase">Impact Certificate</span>
                <span className="text-xs font-bold text-[#414942] opacity-60">EARTH CARBON REGISTRY</span>
              </div>
              
              <div className="w-24 h-24 bg-[#f1f5f9] rounded-2xl flex items-center justify-center">
                 {/* QR Mockup */}
                 <div className="grid grid-cols-2 gap-1.5 w-14 h-14 opacity-40">
                   <div className="bg-[rgb(32,38,130)] rounded-sm" />
                   <div className="bg-[rgb(32,38,130)] rounded-sm" />
                   <div className="bg-[rgb(32,38,130)] rounded-sm" />
                   <div className="bg-[rgb(32,38,130)] rounded-sm" />
                 </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-2xl font-black text-[rgb(32,38,130)]">ECF-0042</span>
                <span className="text-sm font-bold text-[#414942]">Green Valley School</span>
              </div>

              <div className="grid grid-cols-3 gap-2 w-full mt-4">
                {[
                  { label: "Impact", val: "-5.2 t" },
                  { label: "Self-Rel.", val: "68%" },
                  { label: "Circul.", val: "45%" }
                ].map((m) => (
                  <div key={m.label} className="bg-[#f1f5f9] p-3 rounded-2xl flex flex-col items-center">
                    <span className="text-[9px] font-bold text-[#414942] uppercase opacity-60">{m.label}</span>
                    <span className="text-xs font-black text-[rgb(32,38,130)]">{m.val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#bfdbfe] text-[rgb(32,38,130)] px-8 py-2.5 rounded-full text-xs font-black tracking-widest mt-4">
                VERIFIED
              </div>

              <div className="pt-6 border-t border-[#f1f5f9] w-full text-center">
                <span className="text-[9px] font-mono text-[#414942] opacity-40 break-all leading-tight">
                  HASH: a1b2c3d4e5f6g7h8...
                </span>
              </div>
            </div>

            {/* Decorative Corner */}
            <div className="absolute top-8 right-8 text-[rgb(32,38,130)] opacity-10">
              <span className="text-6xl font-serif">🌱</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
