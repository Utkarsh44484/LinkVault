import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ViewLink from './pages/ViewLink';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <AuthProvider>
            <Router>
                {/* app background */}
                <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050505] to-black text-white pb-10 font-sans selection:bg-blue-500/30">
                    {/* global navbar */}
                    <Navbar />

                    {/* page container */}
                    <div className="container mx-auto px-4">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/v/:shortId" element={<ViewLink />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                        </Routes>
                    </div>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
