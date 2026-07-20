import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BrandLogo from './BrandLogo.jsx';
import { Github01Icon, Linkedin01Icon, TwitterIcon, ArrowUp01Icon, Mail02Icon, CheckmarkCircle02Icon } from 'hugeicons-react';
import { useAuthStore } from '../../stores/useAuthStore.js';
import { subscribeToNewsletter } from '../../api/newsletterApi.js';

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const { isAuthenticated, user } = useAuthStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle'); /* idle | loading | success | error */

  /* Auto-reset newsletter status after 5 seconds */
  useEffect(() => {
    if (newsletterStatus === 'success' || newsletterStatus === 'error') {
      const t = setTimeout(() => setNewsletterStatus('idle'), 5000);
      return () => clearTimeout(t);
    }
  }, [newsletterStatus]);

  /* Subscribe to newsletter */
  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus('loading');
    try {
      await subscribeToNewsletter(newsletterEmail);
      setNewsletterStatus('success');
      setNewsletterEmail('');
    } catch (err) {
      console.error('[FOOTER] Newsletter error:', err.message);
      setNewsletterStatus('error');
    }
  };

  return (
    <footer className="border-t-[3px] border-border-main bg-surface">
      {/* ═════ NEWSLETTER SIGNUP ═════ */}
      <div className="relative border-b-[3px] border-border-main bg-surface-alt overflow-hidden">
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-r-[3px] border-b-[3px] border-border-main bg-surface" />
        <div className="absolute top-0 right-0 w-8 h-8 border-l-[3px] border-b-[3px] border-border-main bg-surface" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-r-[3px] border-t-[3px] border-border-main bg-surface" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-l-[3px] border-t-[3px] border-border-main bg-surface" />

        <div className="relative z-10 py-16 md:py-20 px-6 md:px-12 lg:px-20 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Left: messaging */}
            <div className="text-center lg:text-left shrink-0 max-w-md">
              <p className="text-[0.55rem] font-bold tracking-[0.25em] uppercase text-text-muted">
                Never miss an update
              </p>
              <p className="text-[1.8rem] md:text-[2.4rem] font-black leading-[1.1] tracking-[-0.03em] text-text-main mt-3">
                {newsletterStatus === 'success' ? "YOU'RE LOCKED IN." : 'STAY AHEAD OF THE CURVE.'}
              </p>
              <p className="text-text-muted text-sm md:text-base mt-4 max-w-sm mx-auto lg:mx-0 leading-relaxed">
                {newsletterStatus === 'success'
                  ? "Welcome aboard. We'll send you the freshest problems, articles, and cheatsheets every week."
                  : 'New problems, deep-dive articles, and cheatsheets — delivered weekly. No spam, ever.'}
              </p>
            </div>

            {/* Right: form or success */}
            <div className="flex-1 w-full lg:max-w-lg">
              {newsletterStatus === 'success' ? (
                <div className="border-[3px] border-border-main bg-surface p-8 md:p-10 text-center">
                  <CheckmarkCircle02Icon size={48} className="mx-auto text-accent-brand" />
                  <p className="text-text-main font-bold text-lg mt-4">
                    SUBSCRIBED SUCCESSFULLY
                  </p>
                  <p className="text-text-muted text-sm mt-2">
                    From now you will recieve updates from us regularly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleNewsletter}>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={newsletterEmail}
                      onChange={e => setNewsletterEmail(e.target.value)}
                      className="h-14 px-5 border-[3px] border-border-main bg-surface text-sm text-text-main placeholder:text-text-faint flex-1 outline-none focus:border-accent-brand transition-colors"
                      required
                    />
                    <button
                      type="submit"
                      disabled={newsletterStatus === 'loading'}
                      className="h-14 px-8 border-[3px] border-border-main bg-accent-brand text-white font-black text-sm tracking-[0.15em] whitespace-nowrap hover:bg-black hover:text-white hover:border-black hover:shadow-[6px_6px_0_var(--accent)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {newsletterStatus === 'loading' ? 'SUBSCRIBING…' : 'SUBSCRIBE'}
                    </button>
                  </div>
                  <p className="text-[0.5rem] font-bold tracking-[0.2em] uppercase text-text-faint mt-3 text-center sm:text-left">
                    No spam. Unsubscribe anytime.
                  </p>
                </form>
              )}

              {newsletterStatus === 'error' && (
                <p className="text-xs font-bold text-error-text text-center mt-3">
                  SOMETHING WENT WRONG. PLEASE TRY AGAIN.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═════ MAIN SECTION ═════ */}
      <div className="py-20 md:py-28 px-6 md:px-12 lg:px-20">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Brand column */}
          <div className="lg:max-w-xs shrink-0">
            <BrandLogo />
            <p className="mt-6 text-base md:text-lg text-text-muted leading-relaxed">
              Master placements. Crack the code. Land your dream job.
            </p>
            <div className="flex items-center gap-3 mt-8">
              <a href="#" className="w-12 h-12 border-[3px] border-border-main flex items-center justify-center bg-surface-alt hover:bg-black hover:text-white hover:border-black hover:shadow-[4px_4px_0_var(--accent)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300" aria-label="GitHub">
                <Github01Icon size={18} />
              </a>
              <a href="#" className="w-12 h-12 border-[3px] border-border-main flex items-center justify-center bg-surface-alt hover:bg-black hover:text-white hover:border-black hover:shadow-[4px_4px_0_var(--accent)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300" aria-label="Twitter">
                <TwitterIcon size={18} />
              </a>
              <a href="#" className="w-12 h-12 border-[3px] border-border-main flex items-center justify-center bg-surface-alt hover:bg-black hover:text-white hover:border-black hover:shadow-[4px_4px_0_var(--accent)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300" aria-label="LinkedIn">
                <Linkedin01Icon size={18} />
              </a>
            </div>
          </div>

          {/* Link groups — each with brutalist card styling */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 flex-1">
            {/* Resources */}
            <div className="border-[3px] border-border-main bg-surface-alt p-5 md:p-6 hover:shadow-[6px_6px_0_var(--accent)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300">
              <p className="text-[0.6rem] font-bold tracking-[0.2em] text-accent-brand uppercase mb-5">Resources</p>
              <div className="flex flex-col gap-2.5">
                <Link to="/dsa" className="text-sm text-text-main hover:text-accent-brand transition-colors">DSA Problems</Link>
                <Link to="/dbms" className="text-sm text-text-main hover:text-accent-brand transition-colors">DBMS Articles</Link>
                <Link to="/os" className="text-sm text-text-main hover:text-accent-brand transition-colors">OS Articles</Link>
                <Link to="/programming" className="text-sm text-text-main hover:text-accent-brand transition-colors">Programming</Link>
                <Link to="/blog" className="text-sm text-text-main hover:text-accent-brand transition-colors">Blog</Link>
                
              </div>
            </div>

            {/* Community */}
            <div className="border-[3px] border-border-main bg-surface-alt p-5 md:p-6 hover:shadow-[6px_6px_0_var(--accent)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300">
              <p className="text-[0.6rem] font-bold tracking-[0.2em] text-accent-brand uppercase mb-5">Community</p>
              <div className="flex flex-col gap-2.5">
                <Link to="/qa" className="text-sm text-text-main hover:text-accent-brand transition-colors">Q&A Forum</Link>
                <Link to="/users" className="text-sm text-text-main hover:text-accent-brand transition-colors">Users</Link>
                <Link to="/newsletter" className="text-sm text-text-main hover:text-accent-brand transition-colors">Newsletter</Link>
              </div>
            </div>

            {/* Company */}
            <div className="border-[3px] border-border-main bg-surface-alt p-5 md:p-6 hover:shadow-[6px_6px_0_var(--accent)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300">
              <p className="text-[0.6rem] font-bold tracking-[0.2em] text-accent-brand uppercase mb-5">Company</p>
              <div className="flex flex-col gap-2.5">
                <Link to="/about" className="text-sm text-text-main hover:text-accent-brand transition-colors">About</Link>
                {isAuthenticated ? (
                  <>
                    <Link to={`/users/${user?.username}`} className="text-sm text-text-main hover:text-accent-brand transition-colors">Profile</Link>
                    <Link to="/settings/profile" className="text-sm text-text-main hover:text-accent-brand transition-colors">Settings</Link>
                  </>
                ) : (
                  <>
                    <Link to="/sign-in" className="text-sm text-text-main hover:text-accent-brand transition-colors">Login</Link>
                    <Link to="/sign-up" className="text-sm text-text-main hover:text-accent-brand transition-colors">Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═════ BUILT BY — THEWEBYTES ═════ */}
      <div className="w-screen ml-[calc(-50vw+50%)] py-20 md:py-28 px-6 md:px-12 lg:px-20 bg-surface-alt transition-all duration-500">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-[0.5rem] font-bold tracking-[0.3em] uppercase text-text-faint">Built by</span>

          <div className="mt-8">
            <a
              href="https://thewebytes.com"
              target="_blank"
              rel="noopener noreferrer"
              className="thewebytes-banner inline-block border-[3px] border-border-main shadow-[6px_6px_0_var(--shadow-color)] hover:shadow-[12px_12px_0_#3b82f6] dark:hover:shadow-[12px_12px_0_#fb923c] hover:border-[#3b82f6] dark:hover:border-[#fb923c] hover:-translate-x-1.5 hover:-translate-y-1.5 transition-all duration-300"
            >
              <img
                src="/thewebytes.png"
                alt="TheWebytes"
                className="w-full h-auto block dark:invert"
              />
            </a>
          </div>
        </div>
      </div>

      {/* ═════ BOTTOM BAR ═════ */}
      <div className="flex items-center justify-between h-14 px-6 md:px-12 lg:px-20">
        <p className="text-[0.5rem] font-semibold tracking-[0.15em] uppercase text-text-faint">
          &copy; 2026 THEJOBSTARTER. ALL RIGHTS RESERVED.
        </p>
        <button
          onClick={scrollToTop}
          className="w-9 h-9 border-[3px] border-border-main flex items-center justify-center bg-surface-alt hover:bg-black hover:text-white hover:border-black hover:shadow-[4px_4px_0_var(--accent)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300"
          aria-label="Back to top"
        >
          <ArrowUp01Icon size={14} />
        </button>
      </div>
    </footer>
  );
}
