"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function isProductsPath(pathname: string) {
  return pathname === "/products" || pathname.startsWith("/products/");
}

export default function AurawattNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [downloadsOpen, setDownloadsOpen] = useState(false);
  const [datasheetOpen, setDatasheetOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);
  const closeAllMenus = () => {
    setMenuOpen(false);
    setDownloadsOpen(false);
    setDatasheetOpen(false);
  };

  const activeHome = pathname === "/";
  const activeAbout = pathname === "/about";
  const activeProducts = isProductsPath(pathname);
  const activeContact = pathname === "/contact";

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span>✉ info@avavbusiness.com</span>
          <span>📞 +91 95402 63987</span>
          <span>📞 +91 98711 25102</span>
        </div>
        <div className="topbar-right">
          <a href="#" aria-label="Facebook">
            f
          </a>
          <a href="#" aria-label="Instagram">
            ig
          </a>
          <a href="#" aria-label="LinkedIn">
            in
          </a>
        </div>
      </div>

      <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="nav-inner">
          <Link className="logo-btn" href="/" aria-label="Go to home">
            <span className="sr-only">Aurawatt - Your Power Partner</span>
            <span className="logo-image" aria-hidden="true">
              <Image
                src="/aurawattlogo.webp"
                alt=""
                fill
                sizes="220px"
                priority
                style={{ objectFit: "cover", objectPosition: "left center" }}
              />
            </span>
            <div className="logo-text">
              <span className="logo-brand">AURAWATT</span>
              <span className="logo-tagline">Your Power Partner</span>
            </div>
          </Link>

          <button
            className="hamburger"
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className={`nav-links ${menuOpen ? "nav-links--open" : ""}`}>
            <Link
              className={`nav-link ${activeHome ? "nav-link--active" : ""}`}
              href="/"
              onClick={closeAllMenus}
            >
              Home
            </Link>
            <Link
              className={`nav-link ${activeAbout ? "nav-link--active" : ""}`}
              href="/about"
              onClick={closeAllMenus}
            >
              About Us
            </Link>

            <div className="nav-dropdown">
              <Link
                className={`nav-link ${activeProducts ? "nav-link--active" : ""}`}
                href="/products"
                onClick={closeAllMenus}
              >
                Products ▾
              </Link>
              <div className="dropdown-menu" role="menu">
                <Link role="menuitem" href="/products/single-phase" onClick={closeAllMenus}>
                  SP Series (Single Phase)
                </Link>
                <Link role="menuitem" href="/products/three-phase" onClick={closeAllMenus}>
                  TP-L / TP-H Series (Three Phase)
                </Link>
              </div>
            </div>

            <div
              className="nav-dropdown"
              onMouseLeave={() => {
                setDownloadsOpen(false);
                setDatasheetOpen(false);
              }}
            >
              <button
                className="nav-link"
                type="button"
                aria-haspopup="menu"
                aria-expanded={downloadsOpen}
                onClick={() => setDownloadsOpen((v) => !v)}
              >
                Downloads ▾
              </button>
              <div className={`dropdown-menu ${downloadsOpen ? "dropdown-menu--open" : ""}`} role="menu">
                <a
                  role="menuitem"
                  href="/product_catalogue.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeAllMenus}
                >
                  Products Catalogue
                </a>

                <div className="dropdown-sub">
                  <button
                    className="dropdown-sub__trigger"
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={datasheetOpen}
                    onClick={() => setDatasheetOpen((v) => !v)}
                    onMouseEnter={() => setDatasheetOpen(true)}
                  >
                    Products Datasheet ▸
                  </button>
                  <div
                    className={`dropdown-menu dropdown-menu--sub ${
                      datasheetOpen ? "dropdown-menu--open" : ""
                    }`}
                    role="menu"
                  >
                    <a
                      role="menuitem"
                      href="/SP_DataSheet.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeAllMenus}
                    >
                      Aurawatt SP Series
                    </a>
                    <a
                      role="menuitem"
                      href="/TPL_DataSheet.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeAllMenus}
                    >
                      Aurawatt TP-L Series
                    </a>
                    <a
                      role="menuitem"
                      href="/TPH_DataSheet.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeAllMenus}
                    >
                      Aurawatt TP-H Series
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <Link
              className={`nav-link nav-link--cta ${activeContact ? "nav-link--active" : ""}`}
              href="/contact"
              onClick={closeAllMenus}
            >
              Contact
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
