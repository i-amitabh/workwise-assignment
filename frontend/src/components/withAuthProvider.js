// components/withAuthProvider.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const withAuthProvider = (WrappedComponent) => {
  const AuthProvider = (props) => {
    const router = useRouter();

    useEffect(() => {
      // Check for authToken in localStorage
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        router.replace("/");
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };

  return AuthProvider;
};