"use client";
import React from "react";

const PILLARS = [
  {
    title: "Energy",
    icon: "⚡",
    accent: "#f97316",
    actions: [
      "☀️ Solar Rooftop Installation (kW)",
      "🔋 Battery Storage",
      "💡 LED/Efficiency Upgrade",
      "🌿 Biomass/Biogas Energy",
      "☀️ Solar Water Heater",
    ],
  },
  {
    title: "Water",
    icon: "💧",
    accent: "#0060ac",
    actions: [
      "🌧️ Rainwater Harvesting",
      "♻️ Greywater Recycling",
      "🚰 Water-Efficient Fixtures",
      "🌊 Recharge Pit/Borewell",
      "💦 Wastewater Recycling",
    ],
  },
  {
    title: "Waste",
    icon: "♻️",
    accent: "rgb(32,38,130)",
    actions: [
      "🌱 Organic Waste Composting",
      "⚗️ Biogas Digester",
      "📦 Material Recovery/Recycling",
      "⚗️ Waste Reduction Initiative",
      "🥤 Plastic/Paper/Textile/Metal Recycling",
    ],
  },
];

export default function ScopeSection() {
  return (
    <section id="scope" className="py-12 md:py-32 bg-[#f1f5f9] px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#414942] mb-4">
            Registry Scope
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-[rgb(32,38,130)] mb-6">
            What Actions Can Be Registered
          </h2>
          <p className="text-[#414942] max-w-2xl text-lg font-medium">
            Three pillars of climate action, tracked and verified on Indias climate ledger.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PILLARS.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_20px_40px_rgba(26,28,26,0.04)] border-t-[6px] transition-all hover:scale-[1.02]"
              style={{ borderTopColor: pillar.accent }}
            >
              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl">{pillar.icon}</span>
                <h3 className="text-2xl font-black text-[rgb(32,38,130)]">{pillar.title}</h3>
              </div>

              <ul className="space-y-4 mb-8">
                {pillar.actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#414942] font-semibold leading-relaxed">
                    <span className="text-[#bfdbfe] mt-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    </span>
                    {action}
                  </li>
                ))}
              </ul>

              <div className="pt-6 border-t border-[#f1f5f9]">
                <p className="italic text-xs text-[#414942] leading-relaxed opacity-60">
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
