import { FileBadge, ShieldCheck, BarChart2, Sprout, TrendingUp, Users } from "lucide-react";

const BENEFITS = [
  {
    title: "Verified Certificate",
    icon: <FileBadge className="w-6 h-6" />,
    description: "Download a tamper-proof Impact Certificate with your Registry ID, QR code, and SHA-256 digital signature.",
  },
  {
    title: "Public Verification",
    icon: <ShieldCheck className="w-6 h-6" />,
    description: "Anyone can verify your action at climateassetregistry.org/verify/[ID]. Fully transparent and permanent.",
  },
  {
    title: "Track 3 Metrics",
    icon: <BarChart2 className="w-6 h-6" />,
    description: "See your CO₂e reduction, Atmanirbhar % (self-reliance), and Circularity % (waste diverted) in real-time.",
  },
  {
    title: "Social Recognition",
    icon: <Sprout className="w-6 h-6" />,
    description: "Share your verified climate action on LinkedIn, Twitter, and WhatsApp. Show your commitment to the planet.",
  },
  {
    title: "Carbon Credit Pipeline",
    icon: <TrendingUp className="w-6 h-6" />,
    description: "Verified actions contribute to Indias carbon project aggregation pipeline aligned with Verra and MoEF&CC.",
  },
  {
    title: "Community Impact",
    icon: <Users className="w-6 h-6" />,
    description: "Schools, hospitals, MSMEs — all entities can register. Build Indias most comprehensive climate action database.",
  },
];

export default function WhyRegisterSection() {
  return (
    <section id="why-register" className="py-12 md:py-16 bg-white px-4 md:px-8 border-b border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#003527]/50 mb-3">
            Why Register
          </span>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-[#003527] mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>
            Beyond a Certificate
          </h2>
          <p className="text-[#414942] max-w-xl text-sm md:text-base font-medium leading-relaxed opacity-70">
             Your data builds Indias climate ledger, providing verifiable proof of your environmental impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENEFITS.map((benefit, idx) => (
            <div 
              key={idx}
              className="bg-[#fcfdfe] border border-slate-100 p-6 md:p-10 group transition-all duration-300 hover:border-emerald-600/30"
            >
              <div className="text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300">{benefit.icon}</div>
              <h3 className="text-sm font-black text-[#003527] mb-3">{benefit.title}</h3>
              <p className="text-xs md:text-sm text-[#414942] leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity font-bold">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
