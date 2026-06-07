"use client";
import React from "react";
import { signIn } from "next-auth/react";
export const Hero = () => {
  return (
    <div className="hero-root">
      <div className="badge">
        {" "}
        <span>Built for students ✨</span>
        <svg width="16" height="16" fill="none">
          <path
            stroke="#1E1F25"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity=".5"
            strokeWidth="1.25"
            d="M8 4.75 11.25 8m0 0L8 11.25M11.25 8h-6.5"
          ></path>
        </svg>
      </div>
      <h1 className="hero-title">Know exactly where your money goes</h1>
      <p className="hero-subtitle">
        Track expenses, manage your monthly budget, and gain insights through
        beautiful charts and analytics.
      </p>
      <div className="hero-cta">
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
    </div>
  );
};
