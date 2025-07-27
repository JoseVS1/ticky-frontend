import { Navigate } from "react-router";

export const ProtectedRoute = ({ user, loading, children }) => {
    if (loading) {
      return <div className="loading-container">
        <h2>Loading...</h2>
      </div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

  return children;
}
