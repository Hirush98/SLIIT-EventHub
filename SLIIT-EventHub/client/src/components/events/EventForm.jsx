import { useState, useEffect, useRef, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import eventApi from '../../api/eventApi';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import EventCalendar from './EventCalendar';
import ConflictWarning, { NoConflictBadge } from './ConflictWarning';

// ── Constants ──────────────────────────────────────────────
const CATEGORIES = [
  'Academic', 'Workshop', 'Sports',
  'Cultural', 'Social', 'Seminar', 'Competition'
];

const DURATIONS = [1, 2, 3, 4, 5, 6, 7, 8];

// ── Validation schema ──────────────────────────────────────
const eventSchema = Yup.object({
  title: Yup.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .required('Title is required'),

  description: Yup.string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description cannot exceed 1000 characters')
    .required('Description is required'),

  category: Yup.string()
    .oneOf(CATEGORIES, 'Please select a valid category')
    .required('Category is required'),

  eventDate: Yup.date()
    .min(new Date(new Date().setHours(0,0,0,0)), 'Event date must be today or in the future')
    .required('Event date is required'),

  startTime: Yup.string()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format')
    .test('time-range', 'Start time must be between 06:00 and 22:00', (val) => {
      if (!val) return false;
      const [h] = val.split(':').map(Number);
      return h >= 6 && h <= 22;
    })
    .required('Start time is required'),

  duration: Yup.number()
    .min(1, 'Minimum 1 hour')
    .max(8, 'Maximum 8 hours')
    .required('Duration is required'),

  venue: Yup.string()
    .required('Venue is required'),

  capacity: Yup.number()
    .integer('Must be a whole number')
    .min(10, 'Minimum capacity is 10')
    .max(500, 'Maximum capacity is 500')
    .required('Capacity is required'),
});

// ── Component ──────────────────────────────────────────────
const EventForm = ({
  initialValues,  // pre-filled for edit mode
  onSubmit,       // parent handles actual API call
  isSubmitting,
  submitLabel = 'Create Event',
  editMode    = false
}) => {

  // Image upload state
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(
    initialValues?.coverImageUrl || null
  );
  const fileInputRef = useRef(null);

  // Conflict detection state
  const [conflictData,    setConflictData]    = useState(null);  // null=not checked
  const [conflictChecked, setConflictChecked] = useState(false);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const conflictTimerRef = useRef(null);

  // Calendar selected date
  const [calendarDate, setCalendarDate] = useState('');

  // Tag input
  const [tagInput, setTagInput] = useState('');

  const formik = useFormik({
    initialValues: {
      title:       initialValues?.title       || '',
      description: initialValues?.description || '',
      category:    initialValues?.category    || '',
      eventDate:   initialValues?.eventDate   || '',
      startTime:   initialValues?.startTime   || '',
      duration:    initialValues?.duration    || '',
      venue:       initialValues?.venue       || '',
      capacity:    initialValues?.capacity    || 50,
      tags:        initialValues?.tags        || [],
    },
    validationSchema: eventSchema,
    onSubmit: async (values) => {
      // Build FormData for multipart/form-data (image upload)
      const fd = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (key === 'tags') {
          fd.append('tags', JSON.stringify(val));
        } else {
          fd.append(key, val);
        }
      });
      if (imageFile) fd.append('coverImage', imageFile);

      await onSubmit(fd, conflictData);
    }
  });

  // ── Auto conflict check ──────────────────────────────────
  // Triggers when date + startTime + duration all filled
  const runConflictCheck = useCallback(async (date, startTime, duration, excludeId) => {
    if (!date || !startTime || !duration) return;

    setCheckingConflict(true);
    setConflictChecked(false);

    try {
      const result = await eventApi.checkConflict({
        date, startTime,
        duration: String(duration),
        excludeId: excludeId || undefined
      });
      setConflictData(result.hasConflict ? result : null);
      setConflictChecked(true);
    } catch {
      setConflictData(null);
    } finally {
      setCheckingConflict(false);
    }
  }, []);

  // Debounce conflict check — wait 800ms after last change
  useEffect(() => {
    const { eventDate, startTime, duration } = formik.values;
    if (!eventDate || !startTime || !duration) {
      setConflictData(null);
      setConflictChecked(false);
      return;
    }
    if (conflictTimerRef.current) clearTimeout(conflictTimerRef.current);
    conflictTimerRef.current = setTimeout(() => {
      runConflictCheck(
        eventDate, startTime, duration,
        editMode ? initialValues?.id : undefined
      );
    }, 800);
    return () => clearTimeout(conflictTimerRef.current);
  }, [formik.values.eventDate, formik.values.startTime,
      formik.values.duration, runConflictCheck, editMode, initialValues]);

  // ── Sync calendar date with form date ───────────────────
  useEffect(() => {
    if (formik.values.eventDate) setCalendarDate(formik.values.eventDate);
  }, [formik.values.eventDate]);

  // When calendar date clicked → update form date
  const handleCalendarDateSelect = (date) => {
    formik.setFieldValue('eventDate', date);
    setCalendarDate(date);
  };

  // ── Image upload handlers ────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert('Only JPG, PNG and WEBP images are allowed');
      return;
    }
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    setImageFile(file);
    // Create local preview URL
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Tag handlers ─────────────────────────────────────────
  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || formik.values.tags.includes(tag)) return;
    if (formik.values.tags.length >= 10) return;
    formik.setFieldValue('tags', [...formik.values.tags, tag]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    formik.setFieldValue(
      'tags',
      formik.values.tags.filter((t) => t !== tagToRemove)
    );
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }
  };

  // ── Select field class ───────────────────────────────────
  const selectClass = (name) => `
    w-full px-3 py-2.5 rounded-lg border text-sm bg-white text-gray-800
    focus:outline-none focus:ring-2 transition-colors
    disabled:bg-gray-50 disabled:cursor-not-allowed
    ${formik.touched[name] && formik.errors[name]
      ? 'border-red-400 focus:ring-red-200'
      : 'border-gray-300 focus:ring-gray-300 hover:border-gray-400'
    }
  `;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ════════════════════════════════════════
          LEFT COLUMN — Event Form (2/3 width)
          ════════════════════════════════════════ */}
      <div className="lg:col-span-2">
        <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">

          {/* Title */}
          <InputField
            label="Event Title"
            id="title"
            type="text"
            placeholder="e.g. React Workshop for Year 3 Students"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.title}
            touched={formik.touched.title}
            disabled={isSubmitting}
            required
          />

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Describe your event in detail — what will happen, who should attend, what to bring..."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isSubmitting}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm
                         bg-white text-gray-800 placeholder-gray-400
                         focus:outline-none focus:ring-2 transition-colors
                         resize-none disabled:bg-gray-50
                         ${formik.touched.description && formik.errors.description
                           ? 'border-red-400 focus:ring-red-200'
                           : 'border-gray-300 focus:ring-gray-300'}`}
            />
            <div className="flex justify-between">
              {formik.touched.description && formik.errors.description
                ? <p className="text-xs text-red-500">{formik.errors.description}</p>
                : <span/>}
              <span className="text-xs text-gray-400">
                {formik.values.description.length}/1000
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isSubmitting}
              className={selectClass('category')}
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {formik.touched.category && formik.errors.category && (
              <p className="text-xs text-red-500">{formik.errors.category}</p>
            )}
          </div>

          {/* Date + Time + Duration in a row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Event Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Event Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="eventDate"
                name="eventDate"
                min={new Date().toISOString().split('T')[0]}
                value={formik.values.eventDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isSubmitting}
                className={selectClass('eventDate')}
              />
              {formik.touched.eventDate && formik.errors.eventDate && (
                <p className="text-xs text-red-500">{formik.errors.eventDate}</p>
              )}
            </div>

            {/* Start Time */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                min="06:00"
                max="22:00"
                value={formik.values.startTime}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isSubmitting}
                className={selectClass('startTime')}
              />
              {formik.touched.startTime && formik.errors.startTime && (
                <p className="text-xs text-red-500">{formik.errors.startTime}</p>
              )}
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Duration <span className="text-red-500">*</span>
              </label>
              <select
                id="duration"
                name="duration"
                value={formik.values.duration}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isSubmitting}
                className={selectClass('duration')}
              >
                <option value="">Select...</option>
                {DURATIONS.map((h) => (
                  <option key={h} value={h}>
                    {h} hour{h > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              {formik.touched.duration && formik.errors.duration && (
                <p className="text-xs text-red-500">{formik.errors.duration}</p>
              )}
            </div>
          </div>

          {/* Conflict check result */}
          {checkingConflict && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-3 h-3 border-2 border-gray-300
                               border-t-gray-600 rounded-full animate-spin"/>
              Checking for schedule conflicts...
            </div>
          )}
          {!checkingConflict && conflictChecked && conflictData?.hasConflict && (
            <ConflictWarning
              conflicts={conflictData.conflicts}
              onDismiss={() => setConflictData(null)}
            />
          )}
          {!checkingConflict && conflictChecked && !conflictData?.hasConflict && (
            <NoConflictBadge />
          )}

          {/* Venue — free text */}
          <InputField
            label="Venue"
            id="venue"
            type="text"
            placeholder="e.g. A101, F Block Room 302, Main Auditorium, Online"
            value={formik.values.venue}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.venue}
            touched={formik.touched.venue}
            disabled={isSubmitting}
            required
          />

          {/* Capacity */}
          <InputField
            label="Capacity (10 – 500)"
            id="capacity"
            type="number"
            placeholder="e.g. 50"
            value={formik.values.capacity}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.capacity}
            touched={formik.touched.capacity}
            disabled={isSubmitting}
            required
          />

          {/* Cover Image Upload */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Cover Image
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>

            {/* Image preview box — fixed size */}
            <div className="w-full h-48 rounded-xl border-2 border-dashed
                            border-gray-200 overflow-hidden bg-gray-50
                            relative flex items-center justify-center">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Remove overlay */}
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full
                               bg-gray-900/70 text-white flex items-center
                               justify-center hover:bg-gray-900 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none"
                         stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </>
              ) : (
                // Upload prompt
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2
                             text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-10 h-10" fill="none"
                       stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2
                             2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0
                             00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span className="text-xs font-medium">Click to upload image</span>
                  <span className="text-xs">JPG, PNG or WEBP — max 5MB</span>
                </button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />

            {/* Upload / change button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 text-xs text-gray-500 hover:text-gray-800
                         underline transition-colors self-start"
            >
              {imagePreview ? 'Change image' : 'Browse files'}
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Tags
              <span className="text-gray-400 font-normal ml-1">(optional — max 10)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. react, nodejs, web-dev"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                disabled={isSubmitting || formik.values.tags.length >= 10}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300
                           text-sm focus:outline-none focus:ring-2
                           focus:ring-gray-300 hover:border-gray-400"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || formik.values.tags.length >= 10}
              >
                Add
              </Button>
            </div>
            {/* Tag chips */}
            {formik.values.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {formik.values.tags.map((tag) => (
                  <span key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1
                                   rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-400 hover:text-gray-600 ml-0.5"
                    >
                      <svg className="w-3 h-3" fill="none"
                           stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <Button
              type="submit"
              size="full"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : submitLabel}
            </Button>
          </div>
        </form>
      </div>

      {/* ════════════════════════════════════════
          RIGHT COLUMN — Calendar (1/3 width)
          ════════════════════════════════════════ */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Campus Event Calendar
            </h3>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Click any date to see what events are scheduled.
              Dots indicate days with existing events.
            </p>
          </div>
          <EventCalendar
            selectedDate={calendarDate}
            onDateSelect={handleCalendarDateSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default EventForm;
