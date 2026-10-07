import { Link } from 'react-router-dom';

export const NavbarBrand = () => {
  return (
    <div className="flex items-center gap-3 flex-shrink-0">
      <Link to="/home" className="flex items-center gap-2 group">
        <img
          src="/assets/logo.png"
          className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-105"
          alt="Craft World Logo"
        />
      </Link>
    </div>
  );
};
