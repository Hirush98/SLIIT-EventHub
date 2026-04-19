import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import feedbackApi from '../api/feedbackApi';

const EventFeedbackPage = () => {
    const { eventId } = useParams();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // AI Summary State
    const [summary, setSummary] = useState('');
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryError, setSummaryError] = useState('');

    // Modal state
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        const loadFeedback = async () => {
            try {
                const res = await feedbackApi.getEventFeedback(eventId);
                setFeedbacks(res.data);
                if (res.data.length > 0) fetchAiSummary();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load feedback');
            } finally {
                setLoading(false);
            }
        };
        loadFeedback();
    }, [eventId]);

    const fetchAiSummary = async () => {
        setSummaryLoading(true);
        setSummaryError('');
        try {
            const res = await feedbackApi.getFeedbackSummary(eventId);
            setSummary(res.summary);
        } catch (err) {
            console.error("AI Summary failed", err);
            setSummaryError('Unable to fetch AI summary.');
        } finally {
            setSummaryLoading(false);
        }
    };

    const avgRating = feedbacks.length
        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
        : 0;

    const handleOpenModal = async (feedbackId) => {
        setModalOpen(true);
        setModalLoading(true);
        try {
            const res = await feedbackApi.getFeedbackById(feedbackId);
            setSelectedFeedback(res.data);
        } catch {
            setSelectedFeedback(null);
        } finally {
            setModalLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-gray-400 text-sm font-medium">Loading feedback...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

            {/* 🔹 Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Attendee Feedback</h1>
                    <p className="text-sm text-gray-500 mt-1">Review what participants are saying about your event.</p>
                </div>
                <Link
                    to={`/events/${eventId}`}
                    className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-4 py-2 rounded-lg shadow"
                >
                    ← Back to Event Details
                </Link>
            </div>

            {/* ✨ AI Insights Section */}
            {feedbacks.length > 0 && (
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-700 rounded-3xl p-8 shadow-xl border border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                        <h2 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">AI Summary</h2>
                    </div>
                    {summaryLoading ? (
                        <div className="space-y-2 animate-pulse">
                            <div className="h-4 bg-gray-700 rounded-full w-3/4"></div>
                            <div className="h-4 bg-gray-700 rounded-full w-1/2"></div>
                        </div>
                    ) : summaryError ? (
                        <p className="text-red-400 font-medium">{summaryError}</p>
                    ) : summary ? (
                        <p className="text-gray-200 leading-relaxed font-medium italic">{summary}</p>
                    ) : (
                        <p className="text-gray-400 italic">No summary available yet.</p>
                    )}
                </div>
            )}

            {/* 🔹 Summary Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow hover:shadow-md transition-all flex items-center gap-5">
                    <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center text-3xl">⭐</div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Average Rating</p>
                        <p className="text-2xl font-bold text-gray-900">{avgRating} <span className="text-gray-300 text-lg">/ 5</span></p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow hover:shadow-md transition-all flex items-center gap-5">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl">💬</div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Reviews</p>
                        <p className="text-2xl font-bold text-gray-900">{feedbacks.length} <span className="text-gray-400 text-sm font-medium">Responses</span></p>
                    </div>
                </div>
            </div>



            {/* 🔹 Feedback List */}
            <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest px-2 mb-4">Individual Reviews</h3>
                {feedbacks.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">No feedback has been submitted yet.</p>
                    </div>
                ) : (
                    feedbacks.map((fb) => (
                        <div key={fb._id} className="group bg-white border border-gray-100 rounded-2xl p-5 shadow hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex text-yellow-400 text-sm">{[...Array(5)].map((_, i) => (<span key={i}>{i < fb.rating ? '★' : '☆'}</span>))}</div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(fb.createdAt).toLocaleDateString()}</span>
                                </div>
                                {fb.comments && <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed italic">"{fb.comments.length > 200 ? fb.comments.slice(0, 200) + '...' : fb.comments}"</p>}
                            </div>
                            <button onClick={() => handleOpenModal(fb._id)} className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-50 text-gray-700 hover:bg-gray-900 hover:text-white shadow-sm transition-all">View Details</button>
                        </div>
                    ))
                )}
            </div>

            {/* 🔹 Modal (unchanged, with loading/error) */}
            {modalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-800">Feedback Details</h3>
                            <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 shadow-sm">✕</button>
                        </div>
                        <div className="p-8">
                            {modalLoading ? (
                                <div className="flex flex-col items-center py-12 space-y-3">
                                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-xs text-gray-400 font-medium tracking-widest">FETCHING DATA</p>
                                </div>
                            ) : selectedFeedback ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">{selectedFeedback.userId.firstName[0]}</div>
                                        <div><p className="text-lg font-bold text-gray-900 leading-none">
                                            {selectedFeedback.userId.firstName.charAt(0).toUpperCase() + selectedFeedback.userId.firstName.slice(1)}{' '}
                                            {selectedFeedback.userId.lastName.charAt(0).toUpperCase() + selectedFeedback.userId.lastName.slice(1)}
                                        </p>
                                            <p className="text-sm text-gray-500 mt-1">{selectedFeedback.userId.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-yellow-50/50 rounded-2xl border border-yellow-200">
                                        <span className="text-xs font-bold text-yellow-700 uppercase">Score Given</span>
                                        <div className="flex text-yellow-500 text-xl">{[...Array(5)].map((_, i) => (<span key={i}>{i < selectedFeedback.rating ? '★' : '☆'}</span>))}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Comments</label>
                                        <div className="h-48 overflow-y-auto pr-2 custom-scrollbar mt-2">
                                            <p className="text-sm text-gray-700 leading-relaxed bg-gray-100 p-5 rounded-2xl border border-gray-200 min-h-full">{selectedFeedback.comments || "No written comments provided."}</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-center text-gray-400 pt-2 border-t border-gray-50">SUBMITTED ON {new Date(selectedFeedback.createdAt).toLocaleString().toUpperCase()}</p>
                                </div>
                            ) : (
                                <div className="text-center py-10"><p className="text-red-500 font-medium">Failed to fetch feedback details.</p></div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 🔹 Global Error */}
            {error && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
                    {error}
                </div>
            )}
        </div>
    );
};

export default EventFeedbackPage;