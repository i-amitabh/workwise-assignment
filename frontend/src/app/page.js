"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include' // Important for cookies
      });

      const parsedResponse = await response.json();
      console.log('parsedResponse', parsedResponse);

      if (response.ok) {
        router.push('/book');
      } else {
        setErrorMessage(parsedResponse.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

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
              <input onChange={(e) => handleChange(e, 'name')} className="border-2 border-black" type="text" required />
              <br />
            </>
          )}
          <label>Email</label>
          <br />
          <input onChange={(e) => handleChange(e, 'email')} className="border-2 border-black" type="email" required />
          <br />
          <label>Password</label>
          <br />
          <input onChange={(e) => handleChange(e, 'password')} className="border-2 border-black" type="email" required />
          <br />
          {
            errorMessage && <><p className='text-red-600 '>{errorMessage}</p></>
          }
        </form>
        <button onClick={handleSubmit} className="w-full mt-2.5 p-1 bg-blue-600 cursor-pointer">
          {isSignUp ? 'Sign Up' : 'Log In'}
        </button>
      </div>
    </div>
  );
}
