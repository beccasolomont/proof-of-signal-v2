/**
 * Footer — site footer with logo, copyright, and privacy link.
 */
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="w-full bg-background border-t border-border/50">
    <div className="w-full px-6 md:px-16 lg:px-24 max-w-[1600px] mx-auto py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <img
        src="/images/logo.png"
        alt="Proof of Signal logo"
        className="h-24 w-auto"
      />
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <span>© Proof of Signal 2026</span>
        <Link to="/privacy" className="hover:text-foreground transition-colors underline underline-offset-2">
          Privacy &amp; Security
        </Link>
        <Link to="/terms" className="hover:text-foreground transition-colors underline underline-offset-2">
          Terms of Use
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
