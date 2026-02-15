import { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
    // content state
    const [type, setType] = useState('text');
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);

    // expiry options
    const [expiryOption, setExpiryOption] = useState('10');
    const [customDate, setCustomDate] = useState('');

    // security options
    const [password, setPassword] = useState('');
    const [maxViews, setMaxViews] = useState('');

    // ui state
    const [generatedLink, setGeneratedLink] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // handle paste for file uploads
    useEffect(() => {
        const handlePaste = (e) => {
            if (type !== 'file') return;

            const { items } = e.clipboardData;
            for (let i = 0; i < items.length; i++) {
                if (items[i].kind === 'file') {
                    setFile(items[i].getAsFile());
                    setError('');
                    break;
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [type]);

    // drag events
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files?.length) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    // submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setGeneratedLink(null);

        // validate view limit
        if (maxViews && parseInt(maxViews) < 1) {
            setError('Max views must be at least 1.');
            setLoading(false);
            return;
        }

        // validate custom expiry
        if (expiryOption === 'custom') {
            if (!customDate) {
                setError('Please select a valid date and time.');
                setLoading(false);
                return;
            }

            if (new Date(customDate) <= new Date()) {
                setError('Expiration time must be in the future.');
                setLoading(false);
                return;
            }
        }

        try {
            const formData = new FormData();

            // content type
            formData.append('type', type);

            // expiry payload
            if (expiryOption === 'custom') {
                formData.append('expiresAt', new Date(customDate).toISOString());
            } else {
                formData.append('expiresIn', expiryOption);
            }

            // security payload
            if (password) formData.append('password', password);
            if (maxViews) formData.append('maxViews', maxViews);

            // content payload (last)
            if (type === 'text') {
                if (!text) throw new Error('Please enter text.');
                formData.append('content', text);
            } else {
                if (!file) throw new Error('Please select a file.');
                formData.append('file', file);
            }

            const res = await axios.post(
                'http://localhost:5000/api/links/upload',
                formData
            );

            // build shareable url
            const fullUrl = `${window.location.origin}/v/${res.data.linkId}`;
            setGeneratedLink(fullUrl);
        } catch (err) {
            console.error('Upload Error:', err);
            setError('Failed to create link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-6 sm:mt-12 p-5 sm:p-8 rounded-[2rem] bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden">
            {/* background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-500/10 blur-[100px] -z-10 rounded-full pointer-events-none" />

            {/* header */}
            <div className="text-center mb-8 sm:mb-10">
                <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 sm:mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
                    LinkVault
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm font-medium tracking-wide">
                    Secure, Private File Sharing
                </p>
            </div>

            {/* type switch */}
            <div className="flex mb-6 sm:mb-8 bg-black/40 p-1.5 rounded-2xl border border-white/[0.05]">
                <button
                    className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        type === 'text'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20'
                            : 'text-gray-400 hover:text-gray-200'
                    }`}
                    onClick={() => setType('text')}
                >
                    Secure Text
                </button>

                <button
                    className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        type === 'file'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20'
                            : 'text-gray-400 hover:text-gray-200'
                    }`}
                    onClick={() => setType('file')}
                >
                    File Upload
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {type === 'text' ? (
                    <textarea
                        className="w-full h-32 sm:h-44 bg-black/40 border border-white/[0.08] rounded-2xl p-4 sm:p-5 text-gray-200 placeholder-gray-600 focus:border-blue-500/50 outline-none transition-all resize-none font-mono text-xs sm:text-sm"
                        placeholder="Paste your sensitive data here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                ) : (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative w-full h-32 sm:h-44 bg-black/20 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${
                            isDragging
                                ? 'border-indigo-500 bg-indigo-500/5'
                                : 'border-white/[0.08] hover:border-blue-400/30'
                        }`}
                    >
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => setFile(e.target.files[0])}
                        />

                        <div
                            className={`p-3 sm:p-4 rounded-full mb-2 sm:mb-3 ${
                                file ? 'bg-emerald-500/20' : 'bg-white/[0.03]'
                            }`}
                        >
                            <span className="text-2xl sm:text-3xl">
                                {file ? '✨' : '📂'}
                            </span>
                        </div>

                        <span className="text-gray-300 font-medium text-xs sm:text-sm text-center px-4">
                            {file ? file.name : 'Tap, click, or drop your file'}
                        </span>
                    </div>
                )}

                {/* expiry */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <select
                        value={expiryOption}
                        onChange={(e) => setExpiryOption(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/[0.08] text-gray-300 p-3 sm:p-3.5 rounded-xl outline-none text-xs sm:text-sm"
                    >
                        <option value="10">Burn after 10 Minutes</option>
                        <option value="60">Burn after 1 Hour</option>
                        <option value="1440">Burn after 1 Day</option>
                        <option value="custom">Custom Date & Time...</option>
                    </select>

                    {expiryOption === 'custom' && (
                        <input
                            type="datetime-local"
                            value={customDate}
                            onChange={(e) => setCustomDate(e.target.value)}
                            className="flex-1 bg-black/40 border border-white/[0.08] text-gray-300 p-3 sm:p-3.5 rounded-xl outline-none text-xs sm:text-sm"
                        />
                    )}
                </div>

                {/* security */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 p-4 sm:p-5 bg-black/20 rounded-2xl border border-white/[0.05]">
                    <div>
                        <label className="block text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
                            Password Lock
                        </label>
                        <input
                            type="password"
                            placeholder="Optional"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-3 text-gray-200 outline-none text-xs sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
                            View/Download Limit
                        </label>
                        <input
                            type="number"
                            min="1"
                            placeholder="∞ Infinite"
                            value={maxViews}
                            onChange={(e) => {
                                if (!e.target.value || parseInt(e.target.value) >= 1) {
                                    setMaxViews(e.target.value);
                                }
                            }}
                            className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-3 text-gray-200 outline-none text-xs sm:text-sm"
                        />
                    </div>
                </div>

                {/* error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs sm:text-sm text-center">
                        {error}
                    </div>
                )}

                {/* submit */}
                <button
                    disabled={loading}
                    type="submit"
                    className="w-full relative overflow-hidden rounded-xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
                    <div className="relative px-6 py-3.5 sm:py-4 flex items-center justify-center">
                        <span className="text-white text-sm sm:text-base font-bold tracking-wide">
                            {loading ? 'Encrypting...' : 'Generate Secure Link'}
                        </span>
                    </div>
                </button>
            </form>

            {/* generated link */}
            {generatedLink && (
                <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                    <p className="text-emerald-400/80 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3">
                        Link Generated
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <input
                            readOnly
                            value={generatedLink}
                            className="flex-1 bg-black/50 text-emerald-400 font-mono text-xs sm:text-sm p-3 rounded-xl border border-emerald-500/20 outline-none"
                        />

                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(generatedLink);
                                alert('Copied!');
                            }}
                            className="bg-emerald-600/20 text-emerald-400 text-xs sm:text-sm font-semibold px-4 py-3 sm:px-6 rounded-xl border border-emerald-500/30 hover:bg-emerald-600/30"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
