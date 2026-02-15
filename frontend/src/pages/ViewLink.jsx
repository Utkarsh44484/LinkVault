import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ViewLink = () => {
    const { shortId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isProtected, setIsProtected] = useState(false);
    const [password, setPassword] = useState('');
    const [copied, setCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        fetchLinkData();
        // eslint-disable-next-line
    }, [shortId]);

    const fetchLinkData = async (pwd = '') => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`http://localhost:5000/api/links/${shortId}`, { password: pwd });
            setData(res.data);
            setIsProtected(false);
        } catch (err) {
            if (err.response?.status === 401) {
                setIsProtected(true);
                if (pwd) setError('Incorrect password. Please try again.');
            } else {
                setError(err.response?.data?.error || 'Link not found or expired.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        fetchLinkData(password);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(data.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

 const handleForceDownload = async (e) => {
        e.preventDefault();
        setIsDownloading(true);

        const isPDF = data.originalName?.toLowerCase().endsWith('.pdf') || data.content?.toLowerCase().endsWith('.pdf');

        if (isPDF) {
             // Opens securely in the browser's native PDF viewer.
            window.open(data.content, '_blank');
            setIsDownloading(false);
            return;
        }

        // 2. The working Blob method for Word, TXT, PNG, etc.
        try {
            const response = await fetch(data.content);
            const blob = await response.blob();
            
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = data.originalName || 'Secure_File';
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error("Blob download failed, falling back to new tab", err);
            window.open(data.content, '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

    //  state 1: LOADING 
    if (loading && !data && !isProtected) {
        return (
            <div className="max-w-2xl mx-auto mt-20 p-12 text-center bg-white/[0.02] backdrop-blur-xl rounded-[2rem] border border-white/[0.05] shadow-2xl">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
                <h2 className="text-xl font-bold text-gray-200 mb-2 tracking-wide">Decrypting payload...</h2>
                <p className="text-gray-500 text-sm font-medium animate-pulse">Establishing secure connection</p>
            </div>
        );
    }

    //  state 2: ERROR (Not Found / Expired) 
    if (error && !isProtected) {
        return (
            <div className="max-w-xl mx-auto mt-20 p-8 sm:p-10 text-center bg-white/[0.02] backdrop-blur-xl rounded-[2rem] border border-red-500/20 shadow-[0_8px_32px_0_rgba(239,68,68,0.15)] relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-red-500/10 blur-[80px] -z-10 pointer-events-none"></div>
                <div className="text-5xl mb-6 opacity-80">⚠️</div>
                <h2 className="text-2xl font-extrabold text-red-400 mb-3 tracking-tight">Access Denied</h2>
                <p className="text-gray-400 font-medium mb-8 text-sm sm:text-base">{error}</p>
                <Link to="/" className="inline-block bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white font-bold py-3 px-8 rounded-xl transition-all duration-300">
                    Return Home
                </Link>
            </div>
        );
    }

    //  state 3: PASSWORD PROTECTED 
    if (isProtected) {
        return (
            <div className="max-w-md mx-auto mt-20 p-8 sm:p-10 bg-white/[0.02] backdrop-blur-xl rounded-[2rem] border border-indigo-500/20 shadow-[0_8px_32px_0_rgba(79,70,229,0.15)] relative overflow-hidden">
                <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-500/10 blur-[100px] -z-10 rounded-full pointer-events-none"></div>
                
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-black/40 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/10">
                        <span className="text-2xl">🔒</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-100 mb-2 tracking-tight">Encrypted Payload</h2>
                    <p className="text-gray-400 text-xs sm:text-sm font-medium">This link is protected. Enter the decryption key to view.</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    <div>
                        <input
                            type="password"
                            placeholder="Enter password"
                            className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-3 sm:p-4 text-gray-200 placeholder-gray-600 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 text-center tracking-widest text-sm sm:text-base"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                    </div>
                    {error && <p className="text-red-400 text-xs sm:text-sm font-medium text-center bg-red-500/10 py-2 rounded-lg">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-900/20 disabled:opacity-50 text-sm sm:text-base"
                    >
                        {loading ? 'Verifying...' : 'Unlock'}
                    </button>
                </form>
            </div>
        );
    }

    //  state 4: SUCCESS (Viewing Content) 
    return (
        <div className="max-w-3xl mx-auto mt-6 sm:mt-12 p-5 sm:p-8 bg-white/[0.02] backdrop-blur-xl rounded-[2rem] border border-emerald-500/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-emerald-500/10 blur-[100px] -z-10 rounded-full"></div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-8 border-b border-white/[0.05] pb-4 sm:pb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-1 tracking-tight">
                        Secure Payload
                    </h1>
                    <p className="text-gray-500 text-[10px] sm:text-xs font-mono">
                        {new Date(data.createdAt).toLocaleString()}
                    </p>
                </div>
                <span className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg border ${data.type === 'file' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                    {data.type}
                </span>
            </div>

            {data.type === 'text' ? (
                <div className="relative group mt-4">
                    <div className="absolute right-2 sm:right-4 top-2 sm:top-4 z-10">
                        <button onClick={handleCopy} className="bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-gray-300 text-[10px] sm:text-xs font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg backdrop-blur-md transition-all">
                            {copied ? 'Copied! ✓' : 'Copy'}
                        </button>
                    </div>
                    <pre className="w-full bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-4 sm:p-6 text-gray-300 font-mono text-xs sm:text-sm overflow-x-auto whitespace-pre-wrap shadow-inner leading-relaxed">
                        {data.content}
                    </pre>
                </div>
            ) : (
                <div className="text-center py-8 sm:py-12 bg-black/40 rounded-2xl border border-dashed border-white/[0.1]">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                        <span className="text-3xl sm:text-4xl">📄</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-200 mb-2 truncate px-4">{data.originalName || 'Encrypted_File'}</h3>
                    <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-8 font-medium">Ready for secure download.</p>
                    
                    <button
                        onClick={handleForceDownload}
                        disabled={isDownloading}
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] text-white text-sm sm:text-base font-bold py-3 px-6 sm:px-8 rounded-xl transition-all disabled:opacity-70"
                    >
                        {isDownloading ? (
                            <>
                                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Downloading...
                            </>
                        ) : (
                            "Download File"
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ViewLink;