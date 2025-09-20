import { useContext } from "react";
import { NavLink, useNavigate } from "react-router"
import UserContext from "../context/UserContext";
import { fetchWithAuth } from "../helpers/api";

export const Navbar = () => {
  const navigate = useNavigate();
  const { setErrors, user, setUser } = useContext(UserContext);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const handleLogout = async () => {
    try {
      const response = await fetchWithAuth(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
        navigate("/");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <nav>
        <ul>
            <li>
                <NavLink to="/">Home</NavLink>
            </li>

            {user ? (
              <div>
                <li>
                  <span>{user.name || user.email}</span>
                </li>
                <li>
                  <span onClick={handleLogout}>Log out</span>
                </li>
              </div>
            ) : (
              <div>
                <li>
                  <NavLink to="/signup">Sign up</NavLink>
                </li>
                <li>
                  <NavLink to="/login">Log in</NavLink>
                </li>
              </div>
            )}
        </ul>
    </nav>
  )
}
