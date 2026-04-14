import React, { useEffect, useState } from "react";
import axios from "axios";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [repositories, setRepositories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestedRepositories, setSuggestedRepositories] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem("userId");

        const fetchRepositories = async () => {
            try {
                const { data } = await axios.get(
                    `http://localhost:3000/repo/user/${userId}`
                );
                setRepositories(data?.repositories || []);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchSuggestedRepositories = async () => {
            try {
                const { data } = await axios.get(
                    "http://localhost:3000/repo/all"
                );
                setSuggestedRepositories(data || []);
                setSearchResults(data?.repositories || []);
                console.log(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchRepositories();
        fetchSuggestedRepositories();
    }, []);

    useEffect(() => {
        if (searchQuery === "") {
            setSearchResults(suggestedRepositories);
        } else {
            const filtered = suggestedRepositories.filter((repo) =>
                repo.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSearchResults(filtered);
        }
    }, [searchQuery, suggestedRepositories]);

    return (
        <div className="dashboard">

            {/* SIDEBAR */}
            <aside className="sidebar">

                <input
                    className="search"
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <div className="section">
                    <h4>Suggested</h4>

                    {searchResults.length === 0 ? (
                        <p className="empty">No repositories</p>
                    ) : (
                        searchResults.map((repo) => (
                            <a
                                key={repo._id}
                                href={`/repo/${repo._id}`}
                                className="repo-link"
                            >
                                {repo.name}
                            </a>
                        ))
                    )}
                </div>
            </aside>

            {/* MAIN */}
            <main className="main">

                {/* TOPBAR */}
                <div className="topbar">
                    <h1>Dashboard</h1>
                    <div className="user">Suyash</div>
                </div>

                {/* STATS */}
                <div className="stats">
                    <div className="stat-card">
                        <span>Repositories</span>
                        <h2>{repositories.length}</h2>
                    </div>

                    <div className="stat-card">
                        <span>Issues</span>
                        <h2>5</h2>
                    </div>

                    <div className="stat-card">
                        <span>Commits</span>
                        <h2>128</h2>
                    </div>
                </div>

                {/* YOUR REPOS */}
                <div className="section">
                    <h3>Your Repositories</h3>

                    <div className="repo-grid">
                        {repositories.length === 0 ? (
                            <p className="empty">No repositories yet</p>
                        ) : (
                            repositories.map((repo) => (
                                <div key={repo._id} 
                                    className="repo-card"
                                    onClick={() => navigate(`/repo/${repo._id}`)}
                                    > 
                                    <div className="repo-header">
                                        <h4>{repo.name}</h4>
                                        <span className="badge">public</span>
                                    </div>

                                    <p>{repo.description || "No description provided."}</p>

                                    <div className="repo-footer">
                                        <span>🟢 JavaScript</span>
                                        <span>⭐ 12</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ACTIVITY */}
                <div className="section">
                    <h3>Recent Activity</h3>

                    <div className="activity">
                        <div className="activity-item">🔥 Pushed to repo</div>
                        <div className="activity-item">🐛 Opened issue</div>
                        <div className="activity-item">✅ Closed issue</div>
                    </div>
                </div>

            </main>

        </div>
    );
};

export default Dashboard;