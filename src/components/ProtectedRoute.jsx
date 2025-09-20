import { useState, useEffect } from "react";
import { Navigate } from "react-router";
import {jwtDecode} from "jwt-decode"

export const ProtectedRoute = ({ user, loading, children }) => {
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setRedirect(true);
        }
      } catch (err) {
        localStorage.removeItem("token");
        setRedirect(true);
      }
    } else {
      setRedirect(true);
    }
  }, []);

  if (loading) return <div className="loading-container"><h2>Loading...</h2></div>;
  if (!user || redirect) return <Navigate to="/login" replace />;

  return children;
};