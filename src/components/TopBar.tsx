/**
 * TopBar — narrow white bar at the top of the landing page with the company logo.
 * Mirrors the clean, spacious style of cariloop.com's top navigation.
 */
const TopBar = () => (
  <div className="w-full bg-background border-b border-border/30">
    <div className="w-full px-6 md:px-16 lg:px-24 max-w-[1600px] mx-auto flex items-center h-[60px]">
      <img
        src="/images/logo.png"
        alt="Proof of Signal logo"
        className="h-20 w-auto"
      />
    </div>
  </div>
);

export default TopBar;
