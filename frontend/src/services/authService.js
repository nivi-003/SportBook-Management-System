import axios from 'axios'
const API = import.meta.env.VITE_API_URL

export const register = (data) => axios.post(`${API}/api/auth/register`, data)
export const login = (data) => axios.post(`${API}/api/auth/login`, data)
export const adminLogin = (data) => axios.post(`${API}/api/auth/admin/login`, data)
