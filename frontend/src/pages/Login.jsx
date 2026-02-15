import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    // form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // auth helpers
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // submit login form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await axios.post(
                'http://localhost:5000/api/auth/login',
                { username, password }
            );

            // store auth data
            login(res.data.token, res.data.username);

            // redirect after login
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
            <h2 className="text-3xl font-bold text-center text-blue-400 mb-6">
                Login
            </h2>

            {/* error message */}
            {error && (
                <p className="text-red-400 text-center mb-4">
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none"
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                >
                    Sign In
                </button>
            </form>

            <p className="text-gray-400 text-center mt-4">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-blue-400 hover:underline">
                    Register
                </Link>
            </p>
        </div>
    );
};

export default Login;
