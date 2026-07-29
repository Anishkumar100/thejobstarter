import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import { useAuth } from '@clerk/clerk-react';
import { useAuthStore } from '../stores/useAuthStore.js';
import { Check, ArrowRight, Sparkles, Zap, Building2, GraduationCap, LockKeyhole } from 'lucide-react';

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isSignedIn } = useAuth();
  const { user, subscriptionStatus } = useAuthStore();

  /* Center/coordinator check */
  const isCenterOrCoordinator = !!user?.coachingCenter || user?.publicMetadata?.role === 'coordinator' || !!user?.coordinatorFor;
  const isCoordinator = user?.publicMetadata?.role === 'coordinator' || !!user?.coordinatorFor;
  const isSubscribed = subscriptionStatus === 'active';

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest('/site-config/pricing');
        setPlans(res.data);
      } catch (err) {
        console.error('[PRICING] Error:', err.message);
      }
      setLoading(false);
    })();
  }, []);

  const isLoading = loading || (isSignedIn && !user);
  const showRestriction = isSignedIn && isCenterOrCoordinator;

  /* Determine the page title and description based on state */
  const pageTitle = showRestriction
    ? 'Access Restricted — TheJobStarter'
    : 'Pricing — TheJobStarter';
  const pageDesc = showRestriction
    ? ''
    : 'Choose the plan that fits your placement prep journey. Free, Premium, or Lifetime access.';

  return (
    <div className="min-h-screen bg-surface relative">
      <Helmet>
        <title>{pageTitle}</title>
        {pageDesc && <meta name="description" content={pageDesc} />}
      </Helmet>

      {/* ─── LOADING STATE ─── */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
          <div
            className="border-5 border-border-main bg-inverse-bg text-inverse-text px-8 sm:px-10 py-5 font-black text-xl sm:text-2xl uppercase tracking-widest animate-pulse"
            style={{ boxShadow: '8px 8px 0 var(--shadow-color)', borderWidth: '5px' }}
          >
            LOADING...
          </div>
        </div>
      )}

      {/* ─── RESTRICTION SCREEN for center/coordinator users ─── */}
      {showRestriction && (
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6">
          <div
            className="fixed inset-0 opacity-[0.05] pointer-events-none z-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(-45deg, var(--border-main) 0, var(--border-main) 2px, transparent 2px, transparent 12px)',
            }}
          />
          <div className="relative z-10 max-w-xl w-full text-center py-16 sm:py-20">
            {/* Restriction badge */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <span
                className="inline-flex items-center gap-2 border-4 border-border-main bg-error-bg text-error-text px-5 py-2 text-xs font-black uppercase tracking-[3px] -rotate-2"
                style={{ boxShadow: '5px 5px 0 var(--shadow-color)' }}
              >
                <LockKeyhole size={14} /> ACCESS RESTRICTED
              </span>
            </div>

            {/* Icon */}
            <div
              className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-8 border-5 border-border-main bg-inverse-bg text-inverse-text"
              style={{ boxShadow: '10px 10px 0 var(--shadow-color)', borderWidth: '5px' }}
            >
              {isCoordinator ? <Building2 size={48} /> : <GraduationCap size={48} />}
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-[0.95] mb-5 text-text-main">
              You&apos;re Already
              <br />
              <span className="text-accent-brand underline decoration-[5px] underline-offset-[8px]">
                {isCoordinator ? 'Part of a Center' : 'In an Organization'}
              </span>
            </h1>

            {/* Message */}
            <div
              className="border-4 border-border-main bg-bg-secondary px-6 py-5 mb-8 text-left"
              style={{ boxShadow: '6px 6px 0 var(--shadow-color)' }}
            >
              <p className="text-sm sm:text-base font-bold leading-relaxed text-text-main">
                {isCoordinator
                  ? 'As a coordinator, your center handles all subscription management on your behalf. You already have full access to all content and features.'
                  : 'Your coaching center provides you with full access to all platform content. There\'s no need to purchase an individual plan.'}
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/dsa"
                style={{
                  boxShadow: '6px 6px 0 var(--shadow-color)',
                  border: '4px solid var(--border-main)',
                  background: 'var(--bg-inverse)',
                  color: 'var(--text-inverse)'
                }}
                className="inline-flex items-center gap-2 px-8 py-4 font-black text-sm uppercase tracking-wider no-underline transition-all duration-100 ease-out hover:!bg-accent-brand hover:!border-accent-brand active:translate-y-1.5 active:!shadow-none"
              >
                Go to DSA <ArrowRight size={18} />
              </a>
              <a
                href={user?.coachingCenter ? '/dashboard' : '/'}
                style={{
                  boxShadow: '6px 6px 0 var(--shadow-color)',
                  border: '4px solid var(--accent)',
                  background: 'var(--accent)',
                  color: 'var(--text-inverse)'
                }}
                className="inline-flex items-center gap-2 px-8 py-4 font-black text-sm uppercase tracking-wider no-underline transition-all duration-100 ease-out hover:!bg-transparent hover:!text-[var(--accent)] active:translate-y-1.5 active:!shadow-none"
              >
                {user?.coachingCenter ? 'Dashboard' : 'Home'} <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─── PRICING CONTENT (hidden when loading or restricted) ─── */}
      <div className={`${isLoading || showRestriction ? 'hidden' : ''}`}>
        <div
          className="fixed inset-0 opacity-[0.04] pointer-events-none z-0"
          style={{
            backgroundImage:
              'linear-gradient(var(--border-main) 1.5px, transparent 1.5px), linear-gradient(90deg, var(--border-main) 1.5px, transparent 1.5px)',
            backgroundSize: '44px 44px',
          }}
        />

        {/* ─── MARQUEE STRIP ─── */}
        <div
          className="relative z-10 overflow-hidden border-b-4 border-border-main bg-inverse-bg py-2.5"
        >
          <div className="flex whitespace-nowrap animate-[marquee_18s_linear_infinite] gap-8 text-inverse-text font-black text-xs uppercase tracking-[3px]">
            {Array(8).fill(null).map((_, i) => (
              <span key={i} className="flex items-center gap-2 shrink-0">
                <Zap size={12} className="text-accent-highlight" /> NO HIDDEN FEES <Zap size={12} className="text-accent-highlight" /> CANCEL ANYTIME
              </span>
            ))}
          </div>
          <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
        </div>

        {/* ─── PLANS GRID ─── */}
        <section className="px-4 sm:px-6 py-14 sm:py-20 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <span
            className="inline-block border-4 border-border-main bg-accent-brand text-inverse-text px-4 py-1.5 text-xs font-black tracking-[3px] mb-5 uppercase -rotate-2"
            style={{ boxShadow: '4px 4px 0 var(--shadow-color)' }}
          >
            PRICING
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4 text-text-main leading-[0.95]">
            ONE PLATFORM.
            <br className="sm:hidden" />{' '}
            <span className="text-accent-brand underline decoration-[6px] underline-offset-[10px]">EVERY SUBJECT.</span>
          </h1>
          <p className="text-text-muted max-w-xl mx-auto text-sm sm:text-base font-bold border-t-3 border-b-3 border-border-main/30 py-3 inline-block uppercase tracking-wide">
            DSA · DBMS · OS — ALL IN ONE BRUTALIST PACKAGE
          </p>
        </div>

        <div
          className={`mx-auto grid gap-8 sm:gap-12 ${
            plans.length === 1
              ? 'max-w-sm grid-cols-1'
              : plans.length === 2
              ? 'max-w-3xl grid-cols-1 sm:grid-cols-2'
              : 'max-w-5xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          } items-start`}
        >
          {plans.map((plan, idx) => {
            const isHighlighted = plan.highlighted;
            const isFree = plan.price === 0;
            const isSubscribedPlan = !isFree && isSubscribed;
            return (
              <div
                key={plan.id}
                className={`group relative flex flex-col transition-all duration-150 ease-out ${
                  isFree ? 'border-dashed' : ''
                } ${isHighlighted ? 'sm:scale-[1.06] z-10' : ''} ${
                  isSubscribedPlan ? 'opacity-80 pointer-events-none select-none' : ''
                } bg-inverse-bg text-inverse-text ${isSubscribedPlan ? '' : 'hover:-translate-y-1.5 active:translate-y-0 active:!shadow-none'}`}
                style={{
                  borderWidth: isHighlighted ? '6px' : '5px',
                  borderStyle: isFree ? 'dashed' : 'solid',
                  borderColor: isSubscribedPlan ? 'var(--success)' : isHighlighted ? 'var(--accent-highlight)' : 'var(--border-main)',
                  boxShadow: isSubscribedPlan
                    ? `11px 11px 0 var(--success)`
                    : isHighlighted
                    ? '14px 14px 0 var(--accent-highlight)'
                    : '11px 11px 0 var(--shadow-color)',
                }}
              >
                {/* Index tag */}
                <span
                  className="absolute -top-4 -left-4 w-9 h-9 flex items-center justify-center border-4 border-border-main bg-surface text-text-main font-black text-xs z-20 -rotate-6"
                  style={{ boxShadow: '3px 3px 0 var(--shadow-color)' }}
                >
                  0{idx + 1}
                </span>

                {/* Subscribed badge (overrides plan.badge when user is subscribed) */}
                {isSubscribedPlan && (
                  <div
                    className="absolute -top-5 right-4 bg-success text-white px-4 py-1.5 text-xs font-black uppercase tracking-widest border-4 border-border-main rotate-3 whitespace-nowrap z-20 flex items-center gap-1.5"
                    style={{ boxShadow: '3px 3px 0 var(--shadow-color)' }}
                  >
                    <Check size={12} strokeWidth={4} /> SUBSCRIBED
                  </div>
                )}
                {plan.badge && !isSubscribedPlan && (
                  <div
                    className="absolute -top-5 right-4 bg-accent-highlight text-inverse-text px-4 py-1.5 text-xs font-black uppercase tracking-widest border-4 border-border-main rotate-3 whitespace-nowrap z-20 flex items-center gap-1.5"
                    style={{ boxShadow: '3px 3px 0 var(--shadow-color)' }}
                  >
                    <Sparkles size={12} /> {plan.badge}
                  </div>
                )}

                <div className={`h-3 w-full ${isHighlighted ? 'bg-accent-highlight' : 'bg-accent-brand'}`} />

                <div className="px-6 pt-8 pb-0 text-center">
                  <h3
                    className={`text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2 ${
                      isHighlighted ? 'text-accent-highlight' : 'text-inverse-text'
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-sm opacity-70 leading-relaxed font-medium">{plan.description}</p>
                </div>

                <div
                  className="px-6 py-7 text-center"
                  style={{ borderBottom: '3px dashed color-mix(in srgb, var(--border-main) 40%, transparent)' }}
                >
                  <div className="flex items-start justify-center gap-1">
                    <span className="text-lg font-black mt-2 opacity-80">₹</span>
                    <span
                      className={`font-black leading-none tracking-tighter font-mono ${
                        isFree ? 'text-4xl' : 'text-6xl sm:text-7xl'
                      }`}
                    >
                      {plan.price}
                    </span>
                  </div>
                  <span className="block text-xs font-black opacity-60 uppercase mt-2 tracking-widest">
                    {plan.interval === 'monthly'
                      ? '/ MONTH'
                      : plan.interval === 'yearly'
                      ? '/ YEAR'
                      : plan.interval === 'once'
                      ? 'ONE-TIME'
                      : ''}
                  </span>
                </div>

                <ul className="px-6 py-7 flex-1 flex flex-col gap-3.5">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-semibold leading-relaxed">
                      <span
                        className={`shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center border-2 ${
                          isHighlighted
                            ? 'border-accent-highlight text-accent-highlight bg-accent-highlight/10'
                            : 'border-inverse-text/70 text-inverse-text/90'
                        }`}
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="px-6 pb-7">
                  {(() => {
                    if (isSubscribedPlan) {
                      return (
                        <div
                          className="flex items-center justify-center gap-2 w-full border-4 border-border-main px-4 py-4 font-black text-sm uppercase tracking-wider bg-success text-white"
                          style={{ boxShadow: '5px 5px 0 var(--shadow-color)' }}
                        >
                          <Check size={18} strokeWidth={4} /> Subscribed
                        </div>
                      );
                    }
                    const btnClasses = `flex items-center justify-center gap-2 w-full border-4 border-border-main px-4 py-4 font-black text-sm uppercase tracking-wider cursor-pointer no-underline transition-all duration-100 ease-out active:translate-y-1.5 active:!shadow-none ${
                      isHighlighted
                        ? 'bg-accent-highlight text-inverse-text hover:bg-transparent hover:text-accent-highlight'
                        : 'bg-transparent text-inverse-text hover:bg-inverse-text hover:text-[var(--bg-inverse)]'
                    }`;
                    const btnShadow = { boxShadow: '5px 5px 0 var(--shadow-color)' };

                    if (!isSignedIn) {
                      return (
                        <a href="/sign-up" className={btnClasses} style={btnShadow}>
                          {isFree ? 'Get Started' : plan.ctaText} <ArrowRight size={18} />
                        </a>
                      );
                    }
                    if (isFree) {
                      return (
                        <a href="/dsa" className={btnClasses} style={btnShadow}>
                          Start Learning <ArrowRight size={18} />
                        </a>
                      );
                    }
                    return (
                      <a
                        href={`/subscribe?plan=${plan.id}`}
                        className={btnClasses}
                        style={btnShadow}
                      >
                        {plan.ctaText} <ArrowRight size={18} />
                      </a>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 bg-accent-brand text-center relative overflow-hidden border-t-5 border-border-main">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-45deg, var(--inverse-text) 0, var(--inverse-text) 2px, transparent 2px, transparent 16px)',
          }}
        />
        <div className="max-w-lg mx-auto relative z-10">
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter mb-5 text-inverse-text leading-[0.95]">
            Ready to Crack
            <br /> Your Placements?
          </h2>
          <p className="text-inverse-text/80 mb-9 leading-relaxed text-sm sm:text-base font-medium">
            Join 10,000+ students who use TheJobStarter to prepare for DSA, DBMS, and OS interviews.
          </p>
          <a
            href={isSignedIn ? '/dsa' : '/sign-up'}
            className="inline-flex items-center gap-2.5 px-10 sm:px-12 py-4 sm:py-5 border-5 border-border-main bg-inverse-text text-accent-brand font-black text-sm sm:text-base uppercase tracking-wider cursor-pointer no-underline transition-all duration-100 ease-out hover:bg-transparent hover:text-inverse-text active:translate-y-1.5 active:!shadow-none"
            style={{ boxShadow: '7px 7px 0 var(--shadow-color)' }}
          >
            {isSignedIn ? 'Start Learning Now' : 'Get Started Free'}
            <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* ─── FOOTER NOTE ─── */}
      <div className="px-6 py-9 text-center text-xs text-text-faint border-t-4 border-border-main leading-relaxed bg-surface font-medium relative z-10">
        <p>
          All plans include access to TheJobStarter web platform. Prices are in INR.
          <br />
          <span className="font-black">Note:</span> Already subscribed? Your plan card below will show as active.
          <br />
          Need help?{' '}
          <a href="/contact" className="font-black underline text-text-main decoration-2">
            Contact support
          </a>
          .
        </p>
      </div>
      </div>{/* end pricing content wrapper */}
    </div>
  );
}