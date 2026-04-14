import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./profile.css";
import HeatMapProfile from "./Heatmap";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [repos, setRepos] = useState([]);

    const { userId } = useParams();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await axios.get(
                    `http://localhost:3000/userProfile/${userId}`
                );
                console.log(data);
                setUser(data);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchRepos = async () => {
            try {
                const { data } = await axios.get(
                    `http://localhost:3000/repo/user/${userId}`
                );
                setRepos(data?.repositories || []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchUser();
        fetchRepos();
    }, [userId]);

    if (!user) return <div className="profile">Loading...</div>;

    return (
        <div className="profile-main-page">

            {/* LEFT SIDEBAR */}
            <aside className="profile-left">

                <div className="avatar">
                    {user.username?.charAt(0).toUpperCase()}
                </div>

                <h2 className="username">{user.username}</h2>
                <p className="email">{user.email}</p>

                <button className="follow-btn">Follow</button>

                <div className="follow-info">
                    <span><strong>0</strong> followers</span>
                    <span><strong>0</strong> following</span>
                </div>

            </aside>

            {/* MAIN CONTENT */}
            <main className="profile-main">

                {/* TABS */}
                <div className="tabs">
                    <span className="active">Overview</span>
                    <span>Repositories</span>
                    <span>Stars</span>
                </div>

                {/* POPULAR REPOS */}
                <div className="section">
                    <h3>Popular repositories</h3>

                    <div className="repo-grid">
                        {repos.length === 0 ? (
                            <p className="empty">No repositories yet</p>
                        ) : (
                            repos.slice(0, 6).map((repo) => (
                                <div key={repo._id} className="repo-card">
                                    <div className="repo-header">
                                        <h4>{repo.name}</h4>
                                        <span className="badge">public</span>
                                    </div>

                                    <p>{repo.description || "No description"}</p>

                                    <div className="repo-footer">
                                        <span>🟢 JavaScript</span>
                                        <span>⭐ 0</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* HEATMAP PLACEHOLDER */}
                <div className="contribution-section">
                    <h3 className="contribution-title">Contributions</h3>

                    <div className="heatmap-container">
                        <HeatMapProfile />
                    </div>
                </div>

            </main>

        </div>
    );
};

export default Profile;