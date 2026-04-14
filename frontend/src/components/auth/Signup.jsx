import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../authContext.jsx";
import "./auth.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setCurrUser } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:3000/signup", {
        email: email,
        username: username,
        password: password
      });

      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("token", res.data.token);

      setCurrUser(res.data.userId);
      setLoading(false);

      navigate("/");

    } catch (err) {
      console.error(err);
      alert("Signup Failed!");
      setLoading(false);
    }
  }

  return (

    <div className="auth-page">
      <div className="auth-card">
        <div className="logo">⚡</div>
        <h1 className="title">NovaForge</h1>
        <p className="subtitle">Build. Ship. Rule your code.</p>

        <div className="form">
          <input
            type="text"
            placeholder="Username"
            name="username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleSignup} className="auth-btn">{loading ? "Loading..." : "Signup"}</button>
        </div>

        <div className="divider">or continue with</div>

        <div className="socials">
          <button>🐱</button>
          <button>G</button>
          <button>X</button>
        </div>

        <p className="footer">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Sign In</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;