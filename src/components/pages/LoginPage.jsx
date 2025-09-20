import { useContext, useEffect, useState } from "react";
import UserContext from "../../context/UserContext";
import { Link, useNavigate } from "react-router";
import { Errors } from "../Errors";

export const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const { user, setUser, errors, setErrors } = useContext(UserContext);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        setErrors([]);
        setUser(data.user);
        navigate("/");
      } else {
        if (data.errors || data.message) {
          setErrors({ errors: [...(data.errors ? [{message: data.errors[0].message}] : []), ...(data.message ? [{message: data.message}] : [])]});
        }
      }
    } catch (err) {
      setErrors({ errors: [{ message: "Internal server error" }]});
    }
  };

  const handleInputChange = e => {
    setFormData(prevFormData => (
      {
        ...prevFormData,
        [e.target.name]: e.target.value
      }
    ));
  };
  
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Log in</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email: </label>
            <input type="email" value={formData.email} onChange={handleInputChange} name="email" id="email" required />
          </div>
          
          <div>
            <label htmlFor="password">Password: </label>
            <input type="password" value={formData.password} onChange={handleInputChange} name="password" id="password" required />
        
            {errors.errors && errors.errors.length > 0 && <Errors errors={errors.errors} />}
          </div>
        
          <button type="submit">Log in</button>
        </form>

        <span>Don't have an account? <Link to="/signup">Create one</Link>.</span>
      </div>
    </div>
  )
}