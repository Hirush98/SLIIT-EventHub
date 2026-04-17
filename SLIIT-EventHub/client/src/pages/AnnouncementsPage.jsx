import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import announcementApi from '../api/announcementApi';
import Button    from '../components/ui/Button';
import InputField from '../components/ui/InputField';

// ── Priority config ────────────────────────────────────────
const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

const PRIORITY_CONFIG = {
  urgent: { bar: 'bg-red-500',    card: 'border-red-200 bg-red-50',    badge: 'bg-red-100 text-red-700',     label: '🚨 Urgent' },
  high:   { bar: 'bg-orange-400', card: 'border-orange-200 bg-orange-50', badge: 'bg-orange-100 text-orange-700', label: '⚠️ High' },
  normal: { bar: 'bg-indigo-500', card: 'border-gray-200 bg-white',    badge: 'bg-indigo-100 text-indigo-700', label: '📢 Normal' },
  low:    { bar: 'bg-gray-300',   card: 'border-gray-100 bg-gray-50',  badge: 'bg-gray-100 text-gray-600',   label: 'ℹ️ Low' },
};

// ── Time ago helper ────────────────────────────────────────
const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff/60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)} hr ago`;
  return new Date(date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
};

// ── Validation schema ──────────────────────────────────────
const annSchema = Yup.object({
  title:    Yup.string().min(3,'Min 3 characters').max(100,'Max 100 characters').required('Title is required'),
  content:  Yup.string().min(10,'Min 10 characters').max(2000,'Max 2000 characters').required('Content is required'),
  priority: Yup.string().oneOf(PRIORITIES).required('Priority is required'),
});

const AnnouncementsPage = () => {
  const { currentUser }  = useSelector((s) => s.user);
  const role             = currentUser?.role;
  const canPost          = role === 'organizer' || role === 'admin';

  const [announcements,  setAnnouncements]  = useState([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [showForm,       setShowForm]       = useState(false);
  const [toast,          setToast]          = useState('');
  const [deleteId,       setDeleteId]       = useState(null);

  // ── Real-time banner state ─────────────────────────────
  const [liveAlert, setLiveAlert] = useState(null);

  // Fetch all announcements
  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await announcementApi.getAll({ limit: 30 });
      setAnnouncements(res.data || []);
    } catch { /* fail silently */ }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Subscribe to real-time announcements via Socket.IO ──
  // When a new announcement is created, it arrives here instantly
  useEffect(() => {
    const unsubscribe = announcementApi.subscribeToAnnouncements((newAnn) => {
      // Show a live alert banner at the top
      setLiveAlert(newAnn);
      // Also prepend to the list
      setAnnouncements((prev) => [newAnn, ...prev]);
      // Auto-dismiss live alert after 6 seconds
      setTimeout(() => setLiveAlert(null), 6000);
    });
    return unsubscribe;
  }, []);

  // ── Create announcement form ───────────────────────────
  const formik = useFormik({
    initialValues: { title: '', content: '', priority: 'normal' },
    validationSchema: annSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await announcementApi.create(values);
        resetForm();
        setShowForm(false);
        setToast('Announcement posted and broadcast to all users ✅');
        setTimeout(() => setToast(''), 4000);
        fetchAll();
      } catch (err) {
        setToast(err.response?.data?.message || 'Failed to post announcement');
        setTimeout(() => setToast(''), 4000);
      }
    }
  });

  // ── Delete announcement ────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await announcementApi.delete(id);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      setDeleteId(null);
      setToast('Announcement removed');
      setTimeout(() => setToast(''), 3000);
    } catch { setToast('Delete failed'); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* ── Live real-time alert banner ── */}
      {liveAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50
                        w-full max-w-lg px-4">
          <div className="bg-indigo-600 text-white rounded-2xl shadow-xl
                          px-5 py-4 flex items-start gap-3 animate-bounce">
            <span className="text-xl flex-shrink-0">📢</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">New Announcement</p>
              <p className="text-xs text-indigo-200 mt-0.5 truncate">
                {liveAlert.title}
              </p>
            </div>
            <button onClick={() => setLiveAlert(null)}
                    className="text-indigo-300 hover:text-white flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">
            Campus-wide announcements · Updates in real-time
          </p>
        </div>
        {canPost && (
          <Button onClick={() => setShowForm(!showForm)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d={showForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'}/>
            </svg>
            {showForm ? 'Cancel' : 'New Announcement'}
          </Button>
        )}
      </div>

      {/* Toast message */}
      {toast && (
        <div className="px-4 py-3 rounded-xl bg-gray-800 text-white text-sm
                        flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
          </svg>
          {toast}
        </div>
      )}

      {/* Create announcement form */}
      {showForm && canPost && (
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
              </svg>
            </span>
            Post New Announcement
          </h2>

          <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
            <InputField
              label="Title" id="title" type="text"
              placeholder="Brief, clear title"
              value={formik.values.title}
              onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.errors.title} touched={formik.touched.title}
              required
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content" name="content" rows={4}
                placeholder="Write your announcement here..."
                value={formik.values.content}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white
                           focus:outline-none focus:ring-2 resize-none
                           ${formik.touched.content && formik.errors.content
                             ? 'border-red-400 focus:ring-red-200'
                             : 'border-gray-300 focus:ring-gray-300'}`}
              />
              <div className="flex justify-between">
                {formik.touched.content && formik.errors.content
                  ? <p className="text-xs text-red-500">{formik.errors.content}</p>
                  : <span/>}
                <span className="text-xs text-gray-400">{formik.values.content.length}/2000</span>
              </div>
            </div>

            {/* Priority select */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Priority <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {PRIORITIES.map((p) => (
                  <button key={p} type="button"
                    onClick={() => formik.setFieldValue('priority', p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium
                               border transition-all capitalize
                               ${formik.values.priority === p
                                 ? `${PRIORITY_CONFIG[p].badge} border-current`
                                 : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                               }`}>
                    {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" size="md" isLoading={formik.isSubmitting}>
                Post Announcement
              </Button>
              <Button type="button" variant="secondary" size="md"
                onClick={() => { setShowForm(false); formik.resetForm(); }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Announcement list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-200 animate-pulse"/>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white
                        rounded-2xl border border-gray-100">
          <svg className="w-12 h-12 text-gray-300 mb-3" fill="none"
               stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18
                     13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1
                     0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7
                     a3.988 3.988 0 01-1.564-.317z"/>
          </svg>
          <p className="text-gray-400 font-medium">No announcements yet</p>
          {canPost && (
            <button onClick={() => setShowForm(true)}
                    className="mt-3 text-sm text-indigo-600 hover:underline">
              Post the first announcement →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => {
            const cfg     = PRIORITY_CONFIG[ann.priority] || PRIORITY_CONFIG.normal;
            const isOwner = ann.createdBy === currentUser?.id;
            const isAdmin = role === 'admin';

            return (
              <div key={ann._id}
                   className={`rounded-2xl border p-5 transition-colors ${cfg.card}`}>
                <div className="flex items-start gap-4">
                  {/* Priority bar */}
                  <div className={`w-1 rounded-full self-stretch flex-shrink-0 ${cfg.bar}`}/>

                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-bold text-gray-800 text-sm leading-snug">
                        {ann.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${cfg.badge}`}>
                          {ann.priority}
                        </span>
                        {/* Delete button — owner or admin */}
                        {(isOwner || isAdmin) && (
                          deleteId === ann._id ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleDelete(ann._id)}
                                      className="text-xs text-red-600 hover:underline font-medium">
                                Confirm
                              </button>
                              <button onClick={() => setDeleteId(null)}
                                      className="text-xs text-gray-400 hover:underline">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteId(ann._id)}
                                    className="text-gray-300 hover:text-red-500 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {ann.content}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        {ann.authorName}
                      </span>
                      <span>·</span>
                      <span>{timeAgo(ann.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
