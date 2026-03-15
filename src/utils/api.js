import axios from "axios";

let baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

if (typeof window !== "undefined") {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    baseURL = `${protocol}//${hostname}:8000/api/v1`;
}

const api = axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-App-Type": "CMS",
    },
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const lang = localStorage.getItem("i18nextLng") || "en";
            config.headers["lang"] = lang;

            config.headers["X-Domain"] = window.location.hostname;

            const shopId = localStorage.getItem("current_shop_id");
            if (shopId) {
                config.headers["X-Shop-ID"] = shopId;
            }
        }

        const getCookie = (name) => {
            if (typeof document === 'undefined') return null;
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(";").shift();
        };

        const token = getCookie("XSRF-TOKEN");
        if (token) {
            config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
        }

        if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
