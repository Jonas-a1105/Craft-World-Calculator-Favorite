import { NavbarBrand, NavbarNavItems, NavbarUserDropdown, useNavbar } from './nav';

export const Navbar = () => {
  const navbarState = useNavbar();

  return (
    <nav
      className="sticky top-0 z-50 w-full border-none px-4 md:px-8 py-3 mb-6 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--navbar-bg, #141415)',
      }}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        {/* LEFT: Game Brand Logo */}
        <NavbarBrand />

        {/* CENTER: Circular Navigation Buttons with Labels */}
        <NavbarNavItems
          language={navbarState.language}
          currentPath={navbarState.currentPath}
        />

        {/* RIGHT: Relink Button, Player Profile Avatar & Dropdown */}
        <NavbarUserDropdown {...navbarState} />
      </div>
    </nav>
  );
};

export default Navbar;
