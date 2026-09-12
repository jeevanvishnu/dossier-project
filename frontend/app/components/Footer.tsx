import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-bg border-t border-border/40 text-primary pt-16 pb-8">
      <div className="w-full max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Col 1 */}
          <div className="flex flex-col gap-4">
            <span className="font-lexend font-bold text-2xl text-primary">ECTC</span>
            <p className="text-secondary max-w-xs leading-relaxed">
              Delivering structured, professional services for trust-seeking clients.
            </p>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-lexend font-semibold text-primary">Services</h4>
            <div className="flex flex-col gap-3">
              <Link href="#" className="text-secondary hover:text-accent transition-colors">Strategic Consulting</Link>
              <Link href="#" className="text-secondary hover:text-accent transition-colors">Technical Audits</Link>
              <Link href="#" className="text-secondary hover:text-accent transition-colors">Implementation</Link>
            </div>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-lexend font-semibold text-primary">Company</h4>
            <div className="flex flex-col gap-3">
              <Link href="#" className="text-secondary hover:text-accent transition-colors">About Us</Link>
              <Link href="#" className="text-secondary hover:text-accent transition-colors">Careers</Link>
              <Link href="#" className="text-secondary hover:text-accent transition-colors">Blog</Link>
            </div>
          </div>

          {/* Col 4 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-lexend font-semibold text-primary">Contact</h4>
            <div className="flex flex-col gap-3">
              <span className="text-secondary">hello@ectc.com</span>
              <span className="text-secondary">+1 (555) 123-4567</span>
              <span className="text-secondary leading-relaxed">123 Professional Way<br />Suite 400<br />New York, NY 10001</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted text-sm">© {new Date().getFullYear()} ECTC. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-muted hover:text-primary transition-colors text-sm">Privacy Policy</Link>
            <Link href="#" className="text-muted hover:text-primary transition-colors text-sm">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
