// Public API Client (for sign-up, sign-in, etc.)
"use client";
const createPublicClient = () => {
  const request = async (
    endpoint,
    { method = "GET", headers = {}, body } = {}
  ) => {
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : null,
    });

    const parsedResponse = await response.json();

    return parsedResponse;
  };

  return request;
};

// Protected API Client (for authenticated requests)
const createProtectedClient = () => {
  const request = async (
    endpoint,
    { method = "GET", headers = {}, body } = {}
  ) => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      throw new Error("No authentication token available");
    }
    
    const resposne =  await fetch(endpoint, {
      method,
      mode: "cors",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : null,
    });

    return await resposne.json();
  };

  return request;
};

// Create instances
export const publicClient = createPublicClient();
export const protectedClient = createProtectedClient();

// // Usage Example ----------------------------

// // 1. Sign up using public client
// async function signUpUser(userData) {
//   try {
//     const response = await publicClient.request("/sign-up", {
//       method: "POST",
//       body: userData,
//     });

//     // Set the received token in protected client
//     protectedClient.setAuthToken(response.token);
//     return response;
//   } catch (error) {
//     console.error("Signup failed:", error);
//     throw error;
//   }
// }

// // 2. Make authenticated request using protected client
// async function getProtectedData() {
//   try {
//     return await protectedClient.request("/api/protected-data", {
//       method: "GET",
//     });
//   } catch (error) {
//     console.error("Failed to fetch protected data:", error);
//     throw error;
//   }
// }

// // Usage flow
// const userCredentials = {
//   email: "user@example.com",
//   password: "securepassword123",
// };

// // Sign up and then make authenticated request
// signUpUser(userCredentials)
//   .then(() => getProtectedData())
//   .then((data) => console.log("Protected data:", data))
//   .catch((error) => console.error("Error:", error));

// Can also use directly:
// publicClient.request('/sign-in', { method: 'POST', body: userCredentials })
// protectedClient.request('/api/user/profile', { method: 'GET' })
