import axios from 'axios'
const API = import.meta.env.VITE_API_URL
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

export const getDashboard = () => axios.get(`${API}/api/admin/dashboard`, { headers: getHeaders() })
export const getAllBookings = () => axios.get(`${API}/api/admin/bookings`, { headers: getHeaders() })
export const cancelBooking = (id) => axios.patch(`${API}/api/admin/bookings/${id}/cancel`, {}, { headers: getHeaders() })
