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
<div className="container">
  <div className='login-button'>
    <MajorButton 
      onClick={handleSwitch} 
      text={isSignUp ? "Log In" : "Sign Up"}
    />
  </div>
  
  <div className="glass-box">
    <form className='form-wrapper'>
      {isSignUp && (
        <div className="input-wrapper">
          <label htmlFor="name" className="input-label">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            onChange={(e) => handleChange(e, 'name')}
            className="input-container"
            placeholder="Enter your name"
            required
            aria-required="true"
          />
        </div>
      )}

      <div className="input-wrapper">
        <label htmlFor="email" className="input-label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          onChange={(e) => handleChange(e, 'email')}
          className="input-container"
          placeholder="Enter your email"
          required
          aria-required="true"
        />
      </div>

      <div className="input-wrapper">
        <label htmlFor="password" className="input-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          onChange={(e) => handleChange(e, 'password')}
          className="input-container"
          placeholder="••••••••"
          minLength="6"
          required
          aria-required="true"
        />
      </div>

      {errorMessage && (
        <p className="error-text" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="auth-container">
        <MajorButton
          onClick={handleSubmit}
          text={isSignUp ? 'Sign Up' : 'Log In'}
        />
      </div>
    </form>
  </div>
</div>
  );
}
