import axios from 'axios'
const API = import.meta.env.VITE_API_URL
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

export const getVenues = () => axios.get(`${API}/api/venues`, { headers: getHeaders() })
export const getVenue = (id) => axios.get(`${API}/api/venues/${id}`, { headers: getHeaders() })
export const createVenue = (data) => {
  const isFormData = data instanceof FormData
  return axios.post(`${API}/api/venues`, data, {
    headers: isFormData
      ? { ...getHeaders(), 'Content-Type': 'multipart/form-data' }
      : getHeaders()
  })
}
export const updateVenue = (id, data) => {
  const isFormData = data instanceof FormData
  return axios.put(`${API}/api/venues/${id}`, data, {
    headers: isFormData
      ? { ...getHeaders(), 'Content-Type': 'multipart/form-data' }
      : getHeaders()
  })
}
export const deleteVenue = (id) => axios.delete(`${API}/api/venues/${id}`, { headers: getHeaders() })
