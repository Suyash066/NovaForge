import React from "react";
import { useNavigate } from "react-router-dom";
import "./navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  return (
    <nav className="navbar">

      {/* LEFT */}
      <div className="nav-left" onClick={() => navigate("/")}>
        <span className="logo-icon">⚡</span>
        <span className="logo-text">NovaForge</span>
      </div>

      {/* RIGHT */}
      <div className="nav-right">

        <button
          className="create-btn"
          onClick={() => navigate("/repo/create")}
        >
          + Create Repo
        </button>

        <div
          className="profile"
          onClick={() => navigate(`/userProfile/${userId}`)}
        >
          S
        </div>

      </div>

    </nav>
  );
};

export default Navbar;