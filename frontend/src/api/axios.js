import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_URL,
});

// Auto-attach JWT before every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  // Refresh token on 401
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Prevent infinite loops if refresh token endpoint itself fails with 401
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url.includes("/auth/refresh")
      ) {
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = "Bearer " + token;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
          try {
            // Use axios directly to avoid interceptor loops
            const res = await axios.post(
              `${api.defaults.baseURL}/auth/refresh`,
              {
                refreshToken,
              },
            );

            if (res.status === 200) {
              const {
                accessToken,
                refreshToken: newRefreshToken,
                token,
              } = res.data;
              const finalToken = accessToken || token;

              localStorage.setItem("token", finalToken);
              if (newRefreshToken) {
                localStorage.setItem("refreshToken", newRefreshToken);
              }

              processQueue(null, finalToken);

              // Retry the original request
              originalRequest.headers.Authorization = `Bearer ${finalToken}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            processQueue(refreshError, null);
            // Refresh failed (e.g. token expired), log out the user
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            window.location.href = "/login";
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } else {
          processQueue(new Error("No refresh token"), null);
          isRefreshing = false;
          // If no refresh token or it failed
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    },
  );
});

export default api;
