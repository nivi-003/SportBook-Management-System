import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  // On mount, restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken)
        setToken(storedToken)
        setUser(decoded)
      } catch {
        // Token is invalid or expired — clear it
        localStorage.removeItem('token')
      }
    }
  }, [])

  const login = (newToken) => {
    localStorage.setItem('token', newToken)
    const decoded = jwtDecode(newToken)
    setToken(newToken)
    setUser(decoded)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export default AuthProvider
