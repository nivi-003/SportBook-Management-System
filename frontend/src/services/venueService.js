import axios from 'axios'
const API = import.meta.env.VITE_API_URL
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

export const getVenues = () => axios.get(`${API}/api/venues`, { headers: getHeaders() })
export const getVenue = (id) => axios.get(`${API}/api/venues/${id}`, { headers: getHeaders() })
export const createVenue = (formData) => axios.post(`${API}/api/venues`, formData, { headers: { ...getHeaders(), 'Content-Type': 'multipart/form-data' } })
export const updateVenue = (id, formData) => axios.put(`${API}/api/venues/${id}`, formData, { headers: { ...getHeaders(), 'Content-Type': 'multipart/form-data' } })
export const deleteVenue = (id) => axios.delete(`${API}/api/venues/${id}`, { headers: getHeaders() })
