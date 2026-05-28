// Deprecated — the landing page is now responsive and handles desktop + mobile.
// Keeping the file as a no-op stub so bundle.jsx concatenation stays stable.
function DesktopScreen({ tweaks, onStart }) {
  // delegate to the responsive landing
  return <LandingScreen tweaks={tweaks} onStart={onStart} />;
}
window.DesktopScreen = DesktopScreen;
