import { useEffect, useState } from 'react';
import feedbackApi from '../../api/feedbackApi';

const FeedbackQRSection = ({ eventId, isOwner, isAdmin, status }) => {
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const canAccess = (isOwner || isAdmin) && ['approved', 'completed'].includes(status);

    useEffect(() => {
        const loadQR = async () => {
            if (!canAccess) return;
            setLoading(true);
            setError('');
            try {
                const res = await feedbackApi.generateFeedbackQR(eventId);
                setQrData(res);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load QR');
            } finally {
                setLoading(false);
            }
        };
        loadQR();
    }, [eventId, canAccess]);

    const handleCopy = () => {
        navigator.clipboard.writeText(qrData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = async () => {
        if (!qrData?.qrCode) return;
        setDownloading(true);
        try {
            const response = await fetch(qrData.qrCode);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `event-${eventId}-feedback-qr.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Failed to download QR code. Please try again.');
            console.error('Download error:', err);
        } finally {
            setDownloading(false);
        }
    };

    if (!canAccess) return null;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden transition-all hover:shadow-xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-blue-50/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                    <h2 className="text-sm md:text-base font-bold text-gray-900 uppercase tracking-wider">
                        Feedback Access
                    </h2>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Organizer Only
                </span>
            </div>

            <div className="p-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                        <div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-sm text-gray-500 font-medium">Generating secure QR...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center border border-red-100">
                        {error}
                    </div>
                ) : qrData ? (
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        {/* QR Code */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="absolute -inset-3 bg-gradient-to-tr from-blue-200 via-purple-200 to-pink-200 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-500" />
                                <div className="relative bg-white p-4 rounded-xl shadow-lg border border-gray-100 hover:scale-105 transform transition-transform duration-300">
                                    <img
                                        src={qrData.qrCode}
                                        alt="Feedback QR"
                                        className="w-40 h-40 object-contain"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors py-2 px-4 rounded-lg bg-blue-50 hover:bg-blue-100 disabled:opacity-50 shadow-sm"
                            >
                                {downloading ? (
                                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                )}
                                DOWNLOAD PNG
                            </button>
                        </div>

                        {/* Info & Actions */}
                        <div className="flex-1 space-y-5 w-full text-center md:text-left">
                            <div>
                                <h3 className="text-lg md:text-xl font-semibold text-gray-900">Share with Attendees</h3>
                                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                    Display this QR code at the end of your event. Attendees can scan it to instantly provide feedback.
                                </p>
                            </div>

                            {/* Direct Link Box */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide ml-1">Direct Link</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
                                    <input
                                        readOnly
                                        value={qrData.url}
                                        className="bg-transparent text-xs md:text-sm text-gray-700 flex-1 outline-none font-mono truncate"
                                    />
                                    <button
                                        onClick={handleCopy}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm transform ${copied
                                                ? 'bg-green-500 text-white scale-105'
                                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:scale-105'
                                            }`}
                                    >
                                        {copied ? (
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                            </svg>
                                        )}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 text-[12px] md:text-sm text-gray-500 italic bg-gray-50/60 p-2 rounded-lg border border-dashed border-gray-200">
                                <span>💡</span>
                                <p>Tip: Include this QR code in your presentation slides or print it on event materials.</p>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default FeedbackQRSection;