"use client";
import { useState } from "react";
import { toast } from "sonner";
import { instrument } from "@/fonts/fonts";
import { signIn } from "next-auth/react";
export default function Onboarding() {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);

    toast.loading("Connecting... please wait");

    await signIn("google");
  };
  return (
    <div className=" bg-white/40  rounded-2xl shadow-lg p-8 min-h-screen animate-fade-in flex items-center justify-center">
      <div className="flex justify-center items-center p-4 w-[90%] max-w-5xl bg-[#f2eee8] rounded-xl md:rounded-2xl m-8 hover:shadow-xl transition">
        <div className="flex-1 flex-column ">
          <div className="">
            <h1 className={`text-5xl ${instrument.className} leading-tight`}>
              Always broke before month-end?
            </h1>
            <div className={`mt-4  ${instrument.className} space-y-3  text-sm`}>
              <p className="flex items-center gap-2">
                <span className="text-green-600 text-lg">✔</span>
                Track every expense instantly
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-600 text-lg">✔</span>
                See where your money goes
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-600 text-lg">✔</span>
                Built for students
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center ">
            <button
              className="hover:bg-[#E1AA82] gap-3  flex items-center justify-center shadow-md rounded-lg p-2 bg-[#C95A0C] font-serif"
              onClick={handleClick}
              disabled={loading}
            >
              <img src="/icons8-google.svg" className="w-5 h-5 " />
              Continue with Google
            </button>
          </div>
        </div>
        <div className="p-8 md:block hidden md:flex-1 ">
          <img
            src="/hero.jpeg"
            alt=""
            className="w-full h-auto object-cover rounded-3xl "
          />
        </div>
      </div>
    </div>
  );
}
