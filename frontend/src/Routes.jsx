import React, { useEffect } from "react";
import { useNavigate, useRoutes, Navigate } from "react-router-dom";

//Pages List
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";

//Auth Context
import { useAuth } from "./authContext";

const ProtectedRoute = ({ children }) => {
    const {currUser} = useAuth();
    return currUser ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
    const {currUser} = useAuth();
    return !currUser ? children : <Navigate to="/" />;
};

const Routes = () => {
    const { currUser } = useAuth();

    const routes = useRoutes([
        {
            path: "/",
            element: (
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            ),
        },
        {
            path: "/userProfile/:userId",
            element: (
                <ProtectedRoute>
                    <Profile />
                </ProtectedRoute>
            ),
        },
        {
            path: "/login",
            element: (
                <PublicRoute>
                    <Login />
                </PublicRoute>
            ),
        },
        {
            path: "/signup",
            element: (
                <PublicRoute>
                    <Signup />
                </PublicRoute>
            ),
        },
    ]);

    return routes;
};

export default Routes;