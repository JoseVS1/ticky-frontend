import { useContext } from "react";
import { NavLink, useNavigate } from "react-router"
import UserContext from "../context/UserContext";

export const Navbar = () => {
  const navigate = useNavigate();
  const { setErrors, user, setUser } = useContext(UserContext);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const handleLogout = async () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
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
