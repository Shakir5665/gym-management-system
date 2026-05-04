import { ShieldCheck, Globe, ExternalLink, Code2, Rocket, Cpu, Sparkles } from "lucide-react";
import Card from "../components/ui/Card";
import ShakirLogo from "../assets/shakir_logo.png";

export default function AboutPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 bg-gradient-to-br from-brand-500/10 to-transparent p-6 md:p-8 rounded-[var(--radius)] border border-brand-500/20 relative overflow-hidden">

        <div className="relative">
          <div className="relative group">
            <img
              src={ShakirLogo}
              alt="Shakir Tech"
              className="h-24 w-24 md:h-32 md:w-32 object-contain rounded-2xl bg-white/5 border border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute -bottom-2 -right-2 h-7 w-7 md:h-8 md:w-8 bg-brand-500 rounded-full flex items-center justify-center border-4 border-[color:var(--bg)] shadow-lg">
              <ShieldCheck className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
            </div>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left relative z-10">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3 md:mb-2">
            <span className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-[9px] md:text-[10px] font-black tracking-widest text-brand-400 uppercase">
              Powerd by
            </span>
            <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[9px] md:text-[10px] font-black tracking-widest text-green-500 uppercase flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Status: Active
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[color:var(--text)] mb-2">
            Shakir Tech Solutions
          </h1>
          <p className="text-base md:text-lg text-[color:var(--muted)] font-medium max-w-xl mx-auto md:mx-0">
            Transforming ideas into scalable solutions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="p-6 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Rocket className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-[color:var(--text)]">Mission</h3>
          <p className="text-sm text-[color:var(--muted)] leading-relaxed">
            To provide gym owners with an enterprise-grade operating system that eliminates manual work and maximizes member retention through automated risk analysis.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
            <Code2 className="h-5 w-5 text-brand-400" />
          </div>
          <h3 className="text-xl font-bold text-[color:var(--text)]">Technology</h3>
          <p className="text-sm text-[color:var(--muted)] leading-relaxed">
            Built on a cutting-edge MERN stack with real-time state management, secure JWT authentication, and proprietary churn prediction algorithms.
          </p>
        </Card>

        <Card className="p-6 space-y-4 md:col-span-2 lg:col-span-1">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-[color:var(--text)]">Vision</h3>
          <p className="text-sm text-[color:var(--muted)] leading-relaxed">
            Scaling this solution to 100+ clients globally, becoming the gold standard for specialized gym and fitness center management software.
          </p>
        </Card>
      </div>

      <div className="text-center pt-4 opacity-40">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[color:var(--subtle)]">
          SMART GYM • v1.1.0 Enterprise
        </p>
      </div>
    </div>
  );
}
