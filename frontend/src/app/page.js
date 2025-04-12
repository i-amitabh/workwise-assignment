"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { publicClient } from "./apiClient";
import { MajorButton } from "@/components/button";

export default function Home() {
  const [isSignUp, setIsSetUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const API_ENDPOINT = isSignUp ? `${process.env.NEXT_PUBLIC_API_ENDPOINT}/sign-up` : `${process.env.NEXT_PUBLIC_API_ENDPOINT}/sign-in`

  const handleChange = (e, field) => {
    const value = e.target.value;
    setErrorMessage('');
    if (field === 'name') {
      setName(value);
    } else if (field === 'email') {
      setEmail(value);
    } else if (field === 'password') {
      setPassword(value);
    }
  };

  const handleSwitch = () => {
    setIsSetUp((prev) => !prev);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const requestBody = isSignUp 
        ? { name, email, password }
        : { email, password };

      const response = await publicClient(API_ENDPOINT, {
        method: 'POST',
        body: requestBody
      });

      if(response.success) {
        router.push('/book');
      } else {
        setErrorMessage(response.message);
      }
      
    } catch (error) {
      console.log(error);
      setErrorMessage(error.message || 'An error occurred'); // Handle error properly
    }
  }

  return (
<div className="relative h-screen w-screen flex justify-center items-center px-4">
  <div className='absolute top-5 right-4 sm:right-5'>
    <MajorButton 
      onClick={handleSwitch} 
      text={isSignUp ? "Log In" : "Sign Up"} 
      className="text-sm sm:text-base"
    />
  </div>
  
  <div className="w-full max-w-md md:w-[30%] bg-[rgba(255,255,255,0.05)] shadow-glass backdrop-filter backdrop-blur-[20px] rounded-lg border border-white/20 p-4 sm:p-6">
    <form className="space-y-4">
      {isSignUp && (
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-600">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            onChange={(e) => handleChange(e, 'name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
            placeholder="Enter your name"
            required
            aria-required="true"
          />
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-600">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          onChange={(e) => handleChange(e, 'email')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
          placeholder="Enter your email"
          required
          aria-required="true"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-600">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          onChange={(e) => handleChange(e, 'password')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
          placeholder="••••••••"
          minLength="6"
          required
          aria-required="true"
        />
      </div>

      {errorMessage && (
        <p className="mt-2 text-sm text-red-500" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="flex mt-6 w-full justify-center">
        <MajorButton
          onClick={handleSubmit}
          text={isSignUp ? 'Sign Up' : 'Log In'}
          className="w-full max-w-xs px-4 py-2 text-sm sm:text-base"
        />
      </div>
    </form>
  </div>
</div>
  );
}
