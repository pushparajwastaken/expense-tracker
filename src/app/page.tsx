"use client";

import { signIn } from "next-auth/react";

export default function Login() {
  return <button onClick={() => signIn("google")}>Continue with Google</button>;
}
