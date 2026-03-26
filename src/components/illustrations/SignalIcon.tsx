/** SignalIcon — static, single-color version of the hero signal graphic. */
const SignalIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
    <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
    <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="1.6" opacity="0.8" />
    <circle cx="16" cy="16" r="2.5" fill="currentColor" />
  </svg>
);

export default SignalIcon;
