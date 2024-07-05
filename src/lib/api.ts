import axios from "axios";

const api = axios.create();

// Token 过期时间（毫秒）
const TOKEN_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

let tokenExpiryTime: number | null = null;

export const setBaseURL = (url: string) => {
  api.defaults.baseURL = url;
};

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // 检查 token 是否即将过期（比如还有 1 分钟过期）
      if (tokenExpiryTime && Date.now() > tokenExpiryTime - 60000) {
        try {
          const response = await api.post(
            "/user/reenroll",
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const newToken = response.data.token;
          localStorage.setItem("token", newToken);
          tokenExpiryTime = Date.now() + TOKEN_EXPIRY_TIME;
          config.headers["Authorization"] = `Bearer ${newToken}`;
        } catch (error) {
          console.error("Failed to reenroll:", error);
          // 如果 reenroll 失败，我们可能需要强制用户重新登录
          localStorage.removeItem("token");
          window.location.href = "/login";
          return Promise.reject(error);
        }
      } else {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const token = localStorage.getItem("token");
        const response = await api.post(
          "/user/reenroll",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const newToken = response.data.token;
        localStorage.setItem("token", newToken);
        tokenExpiryTime = Date.now() + TOKEN_EXPIRY_TIME;
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (reenrollError) {
        console.error("Reenroll failed:", reenrollError);
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(reenrollError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;