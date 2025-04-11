"use client";
import { useState } from "react";

export default function Home() {
  const [isSignUp, setIsSetUp] = useState(true);

  const handleSwitch = () => {
    setIsSetUp((prev) => !prev);
  };
  return (
    <div className="relative h-screen w-screen flex justify-center items-center">
      <button 
        className="w-[100px] top-0 right-4 absolute mt-2.5 p-1 bg-green-600 cursor-pointer"
        onClick={handleSwitch}
      >
        {isSignUp === true ? "Log In" : "Sign Up"}
      </button>
      <div className="border-2 border-red-700 p-5">
        <form>
          {isSignUp && (
            <>
              <label>Name</label>
              <br />
              <input className="border-2 border-black" type="text" required />
              <br />
            </>
          )}
          <label>Email</label>
          <br />
          <input className="border-2 border-black" type="email" required />
          <br />
          <label>Password</label>
          <br />
          <input className="border-2 border-black" type="email" required />
          <br />
        </form>
        <button className="w-full mt-2.5 p-1 bg-blue-600 cursor-pointer">
          Sign Up
        </button>
      </div>
    </div>
  );
}
