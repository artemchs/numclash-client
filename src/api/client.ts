import axios from "axios";

export const axiosClient = axios.create();

axiosClient.defaults.baseURL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000";

axiosClient.defaults.timeout = 2000;

axiosClient.defaults.withCredentials = true;

axiosClient.interceptors.request.use(
  (config) => {
    config.headers["Content-Type"] = "application/json";
    config.headers.Accept = "application/json";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
