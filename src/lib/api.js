const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Something went wrong"
    );
  }

  return data;
};

export const registerUser = async (payload) => {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const loginUser = async (payload) => {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const logoutUser = async () => {
  return apiRequest("/api/auth/logout", {
    method: "POST"
  });
};

export const getCurrentUser = async () => {
  return apiRequest("/api/auth/me", {
    method: "GET"
  });
};

export const initializeUpload = async (payload) => {
  return apiRequest("/api/files/init", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const completeUpload = async (fileId) => {
  return apiRequest("/api/files/complete", {
    method: "POST",
    body: JSON.stringify({
      fileId
    })
  });
};