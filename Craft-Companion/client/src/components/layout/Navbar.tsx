import { NavbarBrand, NavbarUserDropdown, CoinPriceTicker, useNavbar } from './nav';

export const Navbar = () => {
  const navbarState = useNavbar();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 w-full border-0 border-none outline-none px-2.5 sm:px-6 md:px-8 py-2 sm:py-2.5 transition-colors duration-200 backdrop-blur-md"
      style={{
        backgroundColor: 'var(--navbar-bg, rgba(20, 20, 21, 0.94))',
        border: 'none',
      }}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
        {/* LEFT: Game Brand Logo */}
        <NavbarBrand />

        {/* CENTER: Real-Time Coin Price Ticker Badge */}
        <div className="flex-1 flex items-center justify-center min-w-0 px-1">
          <CoinPriceTicker />
        </div>

        {/* RIGHT: Relink Button, Player Profile Avatar & Dropdown */}
        <NavbarUserDropdown {...navbarState} />
      </div>
    </nav>
  );
};


export default Navbar;
