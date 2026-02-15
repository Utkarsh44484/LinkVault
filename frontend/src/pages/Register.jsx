import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    // form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // submit registration
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await axios.post(
                'http://localhost:5000/api/auth/register',
                { username, password }
            );

            // redirect to login
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
            <h2 className="text-3xl font-bold text-center text-green-400 mb-6">
                Create Account
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
                    placeholder="Choose a Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-green-500 outline-none"
                />

                <input
                    type="password"
                    placeholder="Choose a Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-green-500 outline-none"
                />

                <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
                >
                    Register
                </button>
            </form>

            <p className="text-gray-400 text-center mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-green-400 hover:underline">
                    Login
                </Link>
            </p>
        </div>
    );
};

export default Register;
