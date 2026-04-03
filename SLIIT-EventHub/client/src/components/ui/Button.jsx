import { useRef } from 'react';

/* ============================================================
 /

/* ── Variant style objects (inline CSS, no Tailwind color classes) ── */
const VARIANT_STYLES = {
  /**
   * primary — Navy gradient, white text.
   * Use for important actions that aren't the #1 CTA.
   */
  primary: {
    background:   'linear-gradient(135deg, #0d3060 0%, #092447 100%)',
    color:        '#ffffff',
    border:       'transparent',
    hoverBg:      'linear-gradient(135deg, #1a4f9c 0%, #092447 100%)',
    boxShadow:    '0 4px 12px rgba(9,36,71,0.20)',
    hoverShadow:  '0 4px 16px rgba(9,36,71,0.30)',
  },
  /**
   * gold — Gold gradient, Navy text.
   * Use for top-level CTAs: Register, Create Event, Submit.
   */
  gold: {
    background:   'linear-gradient(135deg, #f5c84a 0%, #d99e1a 100%)',
    color:        '#092447',
    border:       'transparent',
    hoverBg:      'linear-gradient(135deg, #f0b429 0%, #c88e10 100%)',
    boxShadow:    '0 4px 16px rgba(240,180,41,0.40)',
    hoverShadow:  '0 8px 24px rgba(240,180,41,0.55)',
  },
  /**
   * secondary — White background, Navy border & text.
   * Use alongside a primary/gold button.
   */
  secondary: {
    background:   '#ffffff',
    color:        '#092447',
    border:       '#dde4ef',
    hoverBg:      '#f0f3f8',
    boxShadow:    '0 1px 3px rgba(9,36,71,0.08)',
    hoverShadow:  '0 4px 12px rgba(9,36,71,0.10)',
  },
  /**
   * outline — Transparent with Navy border.
   * Use for tertiary/less-prominent actions.
   */
  outline: {
    background:   'transparent',
    color:        '#092447',
    border:       '#092447',
    hoverBg:      '#092447',
    hoverColor:   '#ffffff',
    boxShadow:    'none',
    hoverShadow:  '0 4px 12px rgba(9,36,71,0.20)',
  },
  /**
   * ghost — No background, Blue text.
   * Use for subtle in-panel actions.
   */
  ghost: {
    background:   'transparent',
    color:        '#1a4f9c',
    border:       'transparent',
    hoverBg:      'rgba(26,79,156,0.08)',
    boxShadow:    'none',
    hoverShadow:  'none',
  },
  /**
   * danger — Red for destructive actions.
   */
  danger: {
    background:   '#dc2626',
    color:        '#ffffff',
    border:       'transparent',
    hoverBg:      '#b91c1c',
    boxShadow:    '0 2px 8px rgba(220,38,38,0.25)',
    hoverShadow:  '0 4px 12px rgba(220,38,38,0.35)',
  },
  /**
   * navy-glass — For dark/image backgrounds (NavBar, banners).
   */
  'navy-glass': {
    background:   'rgba(255,255,255,0.10)',
    color:        '#ffffff',
    border:       'rgba(255,255,255,0.20)',
    hoverBg:      'rgba(255,255,255,0.20)',
    boxShadow:    'none',
    hoverShadow:  'none',
    backdropFilter: 'blur(8px)',
  },
};

/* ── Size definitions (pure Tailwind layout classes — safe in v4) ── */
const SIZE_CLASSES = {
  xs:   'px-2.5 py-1    text-xs  gap-1.5 rounded-md',
  sm:   'px-3.5 py-1.5  text-xs  gap-1.5 rounded-lg',
  md:   'px-5   py-2.5  text-sm  gap-2   rounded-lg',
  lg:   'px-6   py-3    text-sm  gap-2   rounded-xl',
  xl:   'px-8   py-3.5  text-base gap-2.5 rounded-xl',
  full: 'w-full px-5   py-2.5  text-sm  gap-2   rounded-lg',
};

/* ── Spinner ──────────────────────────────────────────────── */
const Spinner = ({ small }) => (
  <svg
    className={`${small ? 'w-3 h-3' : 'w-4 h-4'} flex-shrink-0`}
    style={{ animation: 'spin 1s linear infinite' }}
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
);

/* ── Main Button Component ────────────────────────────────── */
const Button = ({
  children,
  type       = 'button',
  variant    = 'primary',
  size       = 'md',
  disabled   = false,
  isLoading  = false,
  onClick,
  className  = '',
  leftIcon,
  rightIcon,
  /** Adds pulsing Gold ring — use on key CTAs like "Register" */
  pulse      = false,
}) => {
  const btnRef  = useRef(null);
  const v       = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const isSmall = size === 'xs' || size === 'sm';

  /* ── Ripple effect ──────────────────────────────────── */
  const handleClick = (e) => {
    if (disabled || isLoading) return;

    const btn  = btnRef.current;
    const rect = btn.getBoundingClientRect();
    const sz   = Math.max(rect.width, rect.height);
    const x    = e.clientX - rect.left - sz / 2;
    const y    = e.clientY - rect.top  - sz / 2;

    const dot = document.createElement('span');
    dot.style.cssText = `
      position:absolute;pointer-events:none;
      width:${sz}px;height:${sz}px;
      top:${y}px;left:${x}px;
      border-radius:50%;
      background:rgba(255,255,255,0.22);
      transform:scale(0);
      animation:ripple 0.6s linear forwards;
    `;
    btn.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove());
    onClick?.(e);
  };

  /* ── Hover handlers (for inline style swapping) ─────── */
  const handleMouseEnter = (e) => {
    if (disabled || isLoading) return;
    const el = e.currentTarget;
    el.style.background   = v.hoverBg   || v.background;
    el.style.color        = v.hoverColor || v.color;
    el.style.boxShadow    = v.hoverShadow;
    el.style.transform    = 'translateY(-1px) scale(1)';
  };
  const handleMouseLeave = (e) => {
    const el = e.currentTarget;
    el.style.background   = v.background;
    el.style.color        = v.color;
    el.style.boxShadow    = v.boxShadow;
    el.style.transform    = 'translateY(0) scale(1)';
  };
  const handleMouseDown  = (e) => {
    e.currentTarget.style.transform = 'translateY(0) scale(0.97)';
  };
  const handleMouseUp    = (e) => {
    e.currentTarget.style.transform = 'translateY(-1px) scale(1)';
  };

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      disabled={disabled || isLoading}
      className={[
        'relative inline-flex items-center justify-center',
        'font-semibold border select-none overflow-hidden',
        'transition-all duration-200 ease-out',
        'disabled:opacity-55 disabled:cursor-not-allowed',
        pulse && !disabled && !isLoading ? 'animate-pulse-gold' : '',
        SIZE_CLASSES[size] || SIZE_CLASSES.md,
        className,
      ].filter(Boolean).join(' ')}
      style={{
        background:     v.background,
        color:          v.color,
        borderColor:    v.border,
        boxShadow:      v.boxShadow,
        backdropFilter: v.backdropFilter || undefined,
        WebkitBackdropFilter: v.backdropFilter || undefined,
        transform:      'translateY(0) scale(1)',
        transition:     'all 0.2s ease',
      }}
    >
      {/* Spinner or left icon */}
      {isLoading
        ? <Spinner small={isSmall} />
        : leftIcon && <span className="flex-shrink-0 flex items-center">{leftIcon}</span>
      }

      {/* Label */}
      <span style={{ opacity: isLoading ? 0.7 : 1 }}>
        {children}
      </span>

      {/* Right icon */}
      {!isLoading && rightIcon && (
        <span className="flex-shrink-0 flex items-center">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;

/* ============================================================
   USAGE EXAMPLES

   // Gold CTA — most prominent
   <Button variant="gold" size="lg" pulse>Register for Event</Button>

   // Primary — Navy
   <Button>Save Changes</Button>

   // Secondary
   <Button variant="secondary">Cancel</Button>

   // Outline
   <Button variant="outline">Learn More</Button>

   // Ghost
   <Button variant="ghost" size="sm">View Details →</Button>

   // Danger
   <Button variant="danger">Delete Event</Button>

   // On dark/image backgrounds
   <Button variant="navy-glass">Browse Events</Button>

   // With icons
   <Button variant="gold" leftIcon={<svg .../>}>Create Event</Button>

   // Loading
   <Button isLoading>Submitting...</Button>

   // Full width form submit
   <Button type="submit" variant="gold" size="full">Sign In</Button>
   ============================================================ */
