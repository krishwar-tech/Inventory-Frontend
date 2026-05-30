const API_URL = "https://inventory-backend-1-n98q.onrender.com/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (res) => {

  if (res.status === 401) {

    localStorage.removeItem("token");

    window.location.href = "/";

    throw new Error("Unauthorized");
  }

  const text = await res.text();

  try {

    return JSON.parse(text);

  } catch {

    return text;
  }
};

const api = {

  get: async (endpoint) => {

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: getHeaders(),
    });

    return handleResponse(res);
  },

  post: async (endpoint, body) => {

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    return handleResponse(res);
  },

  put: async (endpoint, body = {}) => {

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    return handleResponse(res);
  },

  delete: async (endpoint) => {

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    return handleResponse(res);
  },
};

export default api;