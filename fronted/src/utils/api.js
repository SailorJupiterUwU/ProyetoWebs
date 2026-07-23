import axios from 'axios'
//instancia personalizada de api
export const api = axios.create(
    {
        baseURL: import.meta.env.VITE_URL_BASE
    }
);