import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] py-10 px-4 relative">
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute inset-0 bg-grid-fade bg-grid [mask-image:radial-gradient(50%_50%_at_50%_50%,black,transparent)]" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-[color:var(--muted)] hover:text-[color:var(--text)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="text-xs font-bold uppercase tracking-widest text-brand-400">Legal Documentation</div>
        </div>

        <Card className="p-8 md:p-12 glass-strong prose prose-invert max-w-none">
          <h1 className="text-3xl font-black tracking-tight mb-2">Terms and Conditions</h1>
          <p className="text-sm text-[color:var(--muted)] mb-8 italic">Last Updated: May 04, 2026</p>

          <div className="space-y-8 text-[color:var(--text)] leading-relaxed">
            <section>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-[color:var(--text)]">
                <span className="text-[color:var(--brand-ink)] text-lg font-black">01.</span> Acceptance of Terms
              </h2>
              <p className="text-sm opacity-80">
                By creating an account or logging into the Smart Gym Management & Retention System, you (the "Client") and your authorized staff agree to comply with and be bound by these Terms. This is a binding legal agreement between you and the platform provider.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-[color:var(--text)]">
                <span className="text-[color:var(--brand-ink)] text-lg font-black">02.</span> User Accounts & Security
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-sm opacity-80">
                <li>You are responsible for maintaining the confidentiality of your credentials.</li>
                <li>You agree to notify us immediately of any unauthorized use of your account.</li>
                <li>The system is intended for professional gym management; any misuse is strictly prohibited.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-[color:var(--text)]">
                <span className="text-[color:var(--brand-ink)] text-lg font-black">03.</span> Data Privacy & Ownership
              </h2>
              <p className="text-sm opacity-80 mb-3">
                <strong>Member Data:</strong> All data entered regarding your gym members remains your exclusive property. We act as a data processor to provide the service.
              </p>
              <p className="text-sm opacity-80">
                <strong>Security:</strong> We use industry-standard encryption (JWT, bcryptjs) to protect your data. However, you are responsible for the security of the devices used to access the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-[color:var(--text)]">
                <span className="text-[color:var(--brand-ink)] text-lg font-black">04.</span> Service Usage & Intelligence
              </h2>
              <p className="text-sm opacity-80 mb-3">
                <strong>Retention Engine:</strong> The inactivity risk classifications (Low, Medium, High) are provided as business intelligence tools. We do not guarantee the accuracy of human behavior predictions.
              </p>
              <p className="text-sm opacity-80">
                <strong>Rule Enforcement:</strong> The system enforces bans and fines as configured by you. You are solely responsible for the legal implications of enforcing these rules at your physical facility.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-[color:var(--text)]">
                <span className="text-[color:var(--brand-ink)] text-lg font-black">05.</span> Intellectual Property
              </h2>
              <p className="text-sm opacity-80">
                The software architecture, design, and proprietary retention algorithms are the intellectual property of the developer. You may not reverse-engineer, decompile, or copy any part of the system's code.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-[color:var(--text)]">
                <span className="text-[color:var(--brand-ink)] text-lg font-black">06.</span> Limitation of Liability
              </h2>
              <p className="text-sm opacity-80">
                The provider shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the service, including loss of gym revenue, member churn, or data loss.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-xs text-[color:var(--muted)]">
              Questions? Contact your dedicated account manager or technical support team.
            </p>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-[color:var(--subtle)] uppercase tracking-widest">
            Smart Gym Management & Retention System © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
