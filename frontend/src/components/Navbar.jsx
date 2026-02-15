import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    // auth state and helpers
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // logout and redirect
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.05] shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
                
                {/* brand */}
                <Link
                    to="/"
                    className="text-xl md:text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 hover:opacity-80 transition-opacity"
                >
                    LinkVault
                </Link>

                <div className="flex gap-3 md:gap-6 items-center">
                    {/* upload link */}
                    <Link
                        to="/"
                        className="text-xs md:text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Upload
                    </Link>

                    {user ? (
                        <>
                            {/* dashboard link */}
                            <Link
                                to="/dashboard"
                                className="text-xs md:text-sm font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                Dashboard
                            </Link>

                            {/* user info + logout */}
                            <div className="flex items-center gap-3 md:gap-4 pl-3 md:pl-6 border-l border-white/[0.08]">
                                <span className="hidden sm:inline text-sm font-medium text-gray-300">
                                    <span className="text-gray-500 mr-1">Hey,</span>
                                    {user.username}
                                </span>

                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold text-white bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        // auth actions for guests
                        <div className="flex items-center gap-3 md:gap-4 pl-3 md:pl-6 border-l border-white/[0.08]">
                            <Link
                                to="/login"
                                className="text-xs md:text-sm font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="px-4 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
