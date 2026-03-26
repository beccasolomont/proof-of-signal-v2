/**
 * TopBar — narrow white bar at the top of the landing page with the company logo.
 */
const TopBar = () => (
  <div className="w-full bg-background border-b border-border/50">
    <div className="w-full px-6 md:px-16 lg:px-24 max-w-[1600px] mx-auto flex items-center h-14">
      <img
        src="/images/logo.png"
        alt="Proof of Signal logo"
        className="h-8 w-auto"
      />
    </div>
  </div>
);

export default TopBar;
