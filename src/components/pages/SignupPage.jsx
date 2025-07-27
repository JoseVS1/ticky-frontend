import { useContext, useEffect, useState } from "react";
import UserContext from "../../context/UserContext";
import { Link, useNavigate } from "react-router";
import { Errors } from "../Errors";

export const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: ""
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
      const response = await fetch(`${baseUrl}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          ...(formData.name !== "" && { name: formData.name }),
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setErrors([]);
        setUser(data.user);
        navigate("/");
      } else {
        setErrors(data.errors);
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
    <div className="signup-page">
      <div className="signup-card">
        <h1>Sign up</h1>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email: </label>
            <input type="email" value={formData.email} onChange={handleInputChange} name="email" id="email" required />
          </div>

          <div>
            <label htmlFor="name">Username (Optional): </label>
            <input type="text" value={formData.name} onChange={handleInputChange} name="name" id="name" />
          </div>
          
          <div>
            <label htmlFor="password">Password: </label>
            <input type="password" value={formData.password} onChange={handleInputChange} name="password" id="password" required />
          </div>
          
          <div>
            <label htmlFor="confirmPassword">Confirm password: </label>
            <input type="password" value={formData.confirmPassword} onChange={handleInputChange} name="confirmPassword" id="confirmPassword" required />
          
            {errors.length > 0 && <Errors errors={errors} />}
          </div>
          
          <button type="submit">Sign up</button>
        </form>

        <span>Already have an account? <Link to="/login">Log in</Link>.</span>
      </div>
    </div>
  )
}