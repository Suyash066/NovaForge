import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../authContext.jsx";
import "./auth.css";

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { currUser, setCurrUser } = useAuth();

    useEffect(() => {
        localStorage.removeItem("userId");
        localStorage.removeItem("token");

        setCurrUser(null);
    });

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const res = await axios.post("http://localhost:3000/login", {
                email,
                password
            });

            localStorage.setItem("userId", res.data.userId);
            localStorage.setItem("token", res.data.token);

            setCurrUser(res.data.userId);
            setLoading(false);

            navigate("/");
        } catch (err) {
            console.error(err);
            setLoading(false);
            alert("Login Failed!");
            navigate("/login");
            setPassword("");
            setEmail("");
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="logo">⚡</div>
                <h1 className="title">Welcome Back</h1>
                <p className="subtitle">Login to continue your journey</p>

                <div className="form">
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

                    <button onClick={handleLogin} className="auth-btn">{loading ? "Loading..." : "Login"}</button>
                </div>

                <div className="divider">or continue with</div>

                <div className="socials">
                    <button>🐱</button>
                    <button>G</button>
                    <button>X</button>
                </div>

                <p className="footer">
                    New to NovaForge?{" "}
                    <span onClick={() => navigate("/signup")}>Sign up</span>
                </p>
            </div>
        </div>
    );
};

export default Login;