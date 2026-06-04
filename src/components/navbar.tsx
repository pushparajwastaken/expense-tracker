"use client";

import { signIn } from "next-auth/react";

export const Navbar = () => {
  const links = [
    {
      title: "Features",
      href: "#features",
    },
    {
      title: "Dashboard",
      href: "#dashboard",
    },
  ];

  return (
    <nav className="navbar-root">
      <div className="logo">TrackWise</div>

      <div className="links">
        {links.map((link) => (
          <a className="link-items" key={link.title} href={link.href}>
            {link.title}
          </a>
        ))}

        <button
          className="btn"
          onClick={() =>
            signIn("google", {
              callbackUrl: "/dashboard",
            })
          }
        >
          Start Tracking Free
        </button>
      </div>
    </nav>
  );
};
