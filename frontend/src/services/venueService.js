import axios from 'axios'
const API = import.meta.env.VITE_API_URL
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

export const getVenues = () => axios.get(`${API}/api/venues`, { headers: getHeaders() })
export const getVenue = (id) => axios.get(`${API}/api/venues/${id}`, { headers: getHeaders() })
export const createVenue = (data) => axios.post(`${API}/api/venues`, data, { headers: getHeaders() })
export const updateVenue = (id, data) => axios.put(`${API}/api/venues/${id}`, data, { headers: getHeaders() })
export const deleteVenue = (id) => axios.delete(`${API}/api/venues/${id}`, { headers: getHeaders() })
