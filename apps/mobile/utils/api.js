import axios from "axios";
import { getToken } from "./authStorage";
const API_URL = "http://192.168.0.152:3000/api"; // Use your machine's IP
const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    timeout: 15000, // Increase to 15s for spotty LTE data
    headers: {
        "Content-Type": "application/json",
        "Bypass-Tunnel-Reminder": "true",
        "ngrok-skip-browser-warning": "true", // In case you switch back to Ngrok
    },
});
api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
export default api;
