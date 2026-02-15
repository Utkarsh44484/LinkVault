import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    // auth state
    const { user } = useContext(AuthContext);

    // ui state
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // fetch links on mount
    useEffect(() => {
        fetchMyLinks();
    }, []);

    // load user links
    const fetchMyLinks = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/links/user/dashboard');
            setLinks(res.data.links);
        } catch (err) {
            setError('Failed to fetch your links.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // delete a link
    const handleDelete = async (shortId) => {
        if (!window.confirm('Are you sure you want to permanently delete this link?')) return;

        try {
            await axios.delete(`http://localhost:5000/api/links/${shortId}`);

            // update list locally
            setLinks((prev) => prev.filter((link) => link.shortId !== shortId));
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete link.');
        }
    };

    // guard for unauthenticated users
    if (!user) {
        return (
            <div className="text-center mt-20 text-red-400 text-xl">
                Please log in to view this page.
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto mt-6 sm:mt-12 p-5 sm:p-8 bg-white/[0.02] backdrop-blur-xl rounded-[2rem] border border-white/[0.05] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden">
            {/* background glow */}
            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-purple-500/10 blur-[100px] -z-10 rounded-full pointer-events-none" />

            {/* header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold mb-1 sm:mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                        My Vault
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm">
                        Manage your active files and snippets.
                    </p>
                </div>

                <Link
                    to="/"
                    className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1]"
                >
                    + New Upload
                </Link>
            </div>

            {/* error message */}
            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs sm:text-sm">
                    {error}
                </div>
            )}

            {/* content */}
            {loading ? (
                // loading spinner
                <div className="text-center py-20">
                    <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                </div>
            ) : links.length === 0 ? (
                // empty state
                <div className="text-center py-16 bg-black/20 rounded-3xl border border-dashed border-white/[0.08]">
                    <p className="text-gray-400 mb-6 font-medium text-sm">
                        Your vault is currently empty.
                    </p>
                </div>
            ) : (
                // links table
                <div className="overflow-x-auto border border-white/[0.05] rounded-2xl bg-black/40">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/[0.05] text-[10px] sm:text-xs uppercase tracking-wider text-gray-400">
                                <th className="p-3 sm:p-5">Content / Name</th>
                                <th className="p-3 sm:p-5">Short URL</th>
                                <th className="p-3 sm:p-5">Type</th>
                                <th className="p-3 sm:p-5">Views</th>
                                <th className="p-3 sm:p-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs sm:text-sm">
                            {links.map((link) => (
                                <tr
                                    key={link._id}
                                    className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group"
                                >
                                    <td className="p-3 sm:p-5 text-gray-200 truncate max-w-[150px] sm:max-w-[200px]">
                                        {link.originalName ||
                                            (link.content.length > 25
                                                ? `${link.content.substring(0, 25)}...`
                                                : link.content)}
                                    </td>

                                    <td className="p-3 sm:p-5">
                                        <a
                                            href={`/v/${link.shortId}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-400 hover:underline"
                                        >
                                            /v/{link.shortId}
                                        </a>
                                    </td>

                                    <td className="p-3 sm:p-5">
                                        <span
                                            className={`px-2 py-1 text-[10px] sm:text-[11px] uppercase rounded-md font-bold ${
                                                link.type === 'file'
                                                    ? 'bg-purple-500/10 text-purple-400'
                                                    : 'bg-emerald-500/10 text-emerald-400'
                                            }`}
                                        >
                                            {link.type}
                                        </span>
                                    </td>

                                    <td className="p-3 sm:p-5 text-gray-400">
                                        {link.viewCount}
                                        <span className="opacity-50">
                                            {' '}
                                            / {link.maxViews || '∞'}
                                        </span>
                                    </td>

                                    <td className="p-3 sm:p-5 text-right">
                                        <button
                                            onClick={() => handleDelete(link.shortId)}
                                            className="sm:opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
