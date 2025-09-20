import { useEffect, useState } from "react"
import UserContext from "./context/UserContext"
import { ErrorHandler } from "./components/ErrorHandler"
import { Routes, Route } from "react-router"
import { HomePage } from "./components/pages/HomePage"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { SignupPage } from "./components/pages/SignupPage"
import { LoginPage } from "./components/pages/LoginPage"
import {jwtDecode} from "jwt-decode"
import { Navbar } from "./components/Navbar"

export const App = () => {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const getUser = async id => {
      try {
        const response = await fetch(`${baseUrl}/api/users/${id}`);
        const data = await response.json();

        if (response.ok) {
          setUser(data.user);
          setTodos(data.user.todos);
          setTags(data.user.tags);
        }
      } catch (error) {
        console.error(error);
      }
    }

    const token = localStorage.getItem("accessToken");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        getUser(decoded.userId);
      } catch (error) {
        console.error("Failed to decode JWT", error);
      }
    }

    setLoading(false);
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser, todos, setTodos, tags, setTags, loading, setLoading, errors, setErrors }}>
      <ErrorHandler setErrors={setErrors} />

      <Navbar />

      <Routes>
        <Route path="/" element={
          <ProtectedRoute user={user} loading={loading}>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </UserContext.Provider>
  )
}