import { ShieldCheck, Globe, ExternalLink, Code2, Rocket, Cpu, Sparkles } from "lucide-react";
import Card from "../components/ui/Card";
import ShakirLogo from "../assets/shakir_logo.png";

export default function AboutPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 🚀 Hero Section - Optimized for Mobile */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 bg-gradient-to-br from-brand-500/10 to-transparent p-6 md:p-10 rounded-3xl border border-brand-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Cpu className="h-32 w-32 md:h-48 md:w-48" />
        </div>

        <div className="relative">
          <div className="relative group">
            <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-500" />
            <img
              src={ShakirLogo}
              alt="Shakir Tech"
              className="relative h-28 w-28 md:h-36 md:w-36 object-contain rounded-2xl bg-white/5 border border-white/10 shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-3"
            />
            <div className="absolute -bottom-2 -right-2 h-8 w-8 md:h-10 md:w-10 bg-brand-500 rounded-full flex items-center justify-center border-4 border-[color:var(--bg)] shadow-xl z-10">
              <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left relative z-10">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4 md:mb-3">
            <span className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-[10px] font-black tracking-widest text-brand-400 uppercase">
              Powered by
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[color:var(--text)] mb-3 leading-tight">
            Shakir Tech <span className="text-[color:var(--brand-main)]">Solutions</span>
          </h1>
          <p className="text-sm md:text-lg text-[color:var(--muted)] font-medium max-w-xl mx-auto md:mx-0 leading-relaxed">
            Transforming complex business ideas into <span className="text-[color:var(--text)] font-bold">scalable, enterprise-grade</span> digital solutions.
          </p>
        </div>
      </div>

      {/* 🧩 Grid Section - Optimized for Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="p-6 space-y-4 group hover:border-blue-500/30 transition-all duration-300">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
            <Rocket className="h-6 w-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-black tracking-tight text-[color:var(--text)]">Mission</h3>
          <p className="text-sm text-[color:var(--muted)] leading-relaxed font-medium">
            To provide gym owners with an enterprise-grade operating system that eliminates manual work and maximizes member retention through automated risk analysis and gamification.
          </p>
        </Card>

        <Card className="p-6 space-y-4 group hover:border-brand-500/30 transition-all duration-300">
          <div className="h-12 w-12 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 group-hover:bg-brand-500/20 transition-colors">
            <Code2 className="h-6 w-6 text-brand-400" />
          </div>
          <h3 className="text-xl font-black tracking-tight text-[color:var(--text)]">Technology</h3>
          <p className="text-sm text-[color:var(--muted)] leading-relaxed font-medium">
            Built on a cutting-edge <span className="text-[color:var(--brand-main)] font-bold">MERN stack</span> with real-time state management via WebSockets, secure JWT authentication, and proprietary churn prediction algorithms.
          </p>
        </Card>

        <Card className="p-6 space-y-4 md:col-span-2 lg:col-span-1 group hover:border-purple-500/30 transition-all duration-300">
          <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
            <Sparkles className="h-6 w-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-black tracking-tight text-[color:var(--text)]">Vision</h3>
          <p className="text-sm text-[color:var(--muted)] leading-relaxed font-medium">
            Scaling this solution to 100+ clients globally, becoming the gold standard for specialized gym management software through continuous innovation and AI integration.
          </p>
        </Card>
      </div>

      {/* 🏷️ Footer - Mobile Friendly */}
      <div className="text-center pt-8 pb-4">
        <div className="inline-block px-4 py-1.5 rounded-full bg-[color:var(--bg2)] border border-[color:var(--glass-border)] mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[color:var(--subtle)]">
            SMART GYM • v1.1.0 Enterprise
          </p>
        </div>
        <p className="text-[11px] text-[color:var(--muted)] font-medium">
          © 2026 Shakir Tech Solutions. All rights reserved.
        </p>
      </div>
    </div>
  );
}
