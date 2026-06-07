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
