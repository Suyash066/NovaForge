import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [ currUser, setCurrUser ] = useState(null);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if(userId) {
            setCurrUser(userId);
        }   
    }, []);

    const value = {
        currUser, setCurrUser
    }

    return <AuthContext.Provider value={ value }>{ children }</AuthContext.Provider>
};