import { Zap, Droplets, Recycle, ShieldCheck } from "lucide-react";

const PILLARS = [
  {
    title: "Energy",
    icon: <Zap className="w-5 h-5 text-[#a8f928]" />,
    actions: [
      "Rooftop Solar (kW)",
      "Solar Water Heating",
      "LED Retrofit",
      "Biogas (cooking)",
    ],
  },
  {
    title: "Water",
    icon: <Droplets className="w-5 h-5 text-[#a8f928]" />,
    actions: [
      "Rain Water Harvesting",
      "Waste Water Recycled",
      "Waterless Urinals",
    ],
  },
  {
    title: "Waste",
    icon: <Recycle className="w-5 h-5 text-[#a8f928]" />,
    actions: [
      "Waste Composting",
    ],
  },
];

export default function TrustAndScopeSection() {
  return (
    <section id="trust-scope" className="py-12 md:py-20 bg-[#f8faf7] px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        
        {/* Header (Optional, if needed, but the user asked for cards) */}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden shadow-2xl">
          
          {/* Left Card: The Digital Conservator Framework */}
          <div className="bg-white p-8 md:p-16 flex flex-col items-start gap-8 border-r border-slate-100 relative group">
            {/* Animated Technical Icon */}
            <div className="w-16 h-16 bg-[#eff7f2] flex items-center justify-center text-[#003527] relative">
              <ShieldCheck className="w-8 h-8 relative z-10" />
              <div className="absolute inset-0 bg-[#003527]/5 animate-ping rounded-none" />
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#003527]/40">
                  Transparent by Design
                </p>
                <h2 className="text-2xl md:text-4xl font-black text-[#003527] leading-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
                  Digital <br />Conservator <br />Framework
                </h2>
              </div>
              
              <div className="space-y-4 text-sm md:text-base text-[#414942] font-semibold leading-relaxed opacity-90 max-w-md">
                <p>
                  Our proprietary data logic engine processes complex environmental
                  data into clean, trustable assets. We eliminate greenwashing with
                  institutional-grade, immutable data logs.
                </p>
                <p>
                  Every action receives a unique Registry ID and a
                  SHA-256 digital signature, ensuring permanent record integrity.
                </p>
              </div>
            </div>
          </div>

          {/* Right Card: Registry Scope (Energy vs Water+Waste) */}
          <div className="bg-[#003527] p-8 md:p-16 text-white relative overflow-hidden flex flex-col justify-between">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white rotate-45 transform translate-x-1/2 -translate-y-1/2 animate-pulse" />
              <div className="absolute bottom-0 left-0 w-64 h-64 border-2 border-white rotate-12 transform -translate-x-1/2 translate-y-1/2 opacity-50" />
            </div>

            <div className="relative z-10 space-y-10">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#a8f928]/60">
                  Registry Scope
                </p>
                <h3 className="text-2xl md:text-3xl font-black">What Actions Can Be Registered</h3>
              </div>

              {/* High Density 2-Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                {/* Column 1: Energy */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    {PILLARS[0].icon}
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-white/60">{PILLARS[0].title}</h4>
                  </div>
                  <ul className="space-y-3">
                    {PILLARS[0].actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/80 font-bold leading-tight hover:text-[#a8f928] cursor-default transition-colors">
                        <span className="text-[#a8f928]">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 2: Water & Waste */}
                <div className="space-y-10">
                  {/* Water */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      {PILLARS[1].icon}
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-white/60">{PILLARS[1].title}</h4>
                    </div>
                    <ul className="space-y-3">
                      {PILLARS[1].actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/80 font-bold leading-tight hover:text-[#a8f928] transition-colors">
                          <span className="text-[#a8f928]">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Waste */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      {PILLARS[2].icon}
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-white/60">{PILLARS[2].title}</h4>
                    </div>
                    <ul className="space-y-3">
                      {PILLARS[2].actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/80 font-bold leading-tight hover:text-[#a8f928] transition-colors">
                          <span className="text-[#a8f928]">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
