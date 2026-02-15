import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // restore auth state on refresh
    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');

        if (!token) return;

        setUser({ token, username });

        // attach token to all axios requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }, []);

    // handle login
    const login = (token, username) => {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);

        setUser({ token, username });

        // persist auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    // handle logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');

        setUser(null);

        // remove auth header
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
