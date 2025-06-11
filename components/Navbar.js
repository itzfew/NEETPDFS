import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link href="/" className="brand">
          EduHub Study Materials
        </Link>

        <div className="nav-links hidden md:flex">
          <Link href="/" className="hover:text-indigo-200 transition-colors">
            Home
          </Link>
          <Link href="/policies/contact" className="hover:text-indigo-200 transition-colors">
            Contact
          </Link>
          <Link href="/policies/terms" className="hover:text-indigo-200 transition-colors">
            Terms
          </Link>
          <Link href="/policies/refund" className="hover:text-indigo-200 transition-colors">
            Refund Policy
          </Link>
        </div>

        <button
          className="hamburger md:hidden"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
          <Link href="/" className="hover:text-indigo-200 transition-colors" onClick={toggleMenu}>
            Home
          </Link>
          <Link href="/policies/contact" className="hover:text-indigo-200 transition-colors" onClick={toggleMenu}>
            Contact
          </Link>
          <Link href="/policies/terms" className="hover:text-indigo-200 transition-colors" onClick={toggleMenu}>
            Terms
          </Link>
          <Link href="/policies/refund" className="hover:text-indigo-200 transition-colors" onClick={toggleMenu}>
            Refund Policy
          </Link>
        </div>
      </div>
    </nav>
  );
}
