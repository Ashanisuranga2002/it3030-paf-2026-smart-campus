import { useEffect, useMemo, useState } from 'react';

const DEFAULT_FORM = {
  description: '',
  location: '',
  category: 'IT',
  priority: 'MEDIUM',
  contactEmail: '',
  contactPhone: '',
  attachments: []
};

function TicketFormModal({
  open,
  onClose,
  onSubmit,
  title = 'Raise Ticket',
  submitLabel = 'Submit Ticket',
  initialValues,
  submitting = false
}) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [error, setError] = useState('');
  const initKey = initialValues?.id ?? '__create__';

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialValues) {
      setForm({
        description: initialValues.description || '',
        location: initialValues.location || '',
        category: initialValues.category || 'IT',
        priority: initialValues.priority || 'MEDIUM',
        contactEmail: initialValues.contactEmail || '',
        contactPhone: initialValues.contactPhone || '',
        attachments: initialValues.attachments || []
      });
    } else {
      setForm(DEFAULT_FORM);
    }

    setError('');
  }, [open, initKey]);

  const attachmentPreview = useMemo(
    () =>
      form.attachments.map((attachment, index) => ({
        key: `${attachment.fileName}-${index}`,
        fileName: attachment.fileName,
        contentType: attachment.contentType,
        previewSrc: attachment.dataBase64?.startsWith('data:')
          ? attachment.dataBase64
          : `data:${attachment.contentType};base64,${attachment.dataBase64}`
      })),
    [form.attachments]
  );

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const commaIndex = typeof dataUrl === 'string' ? dataUrl.indexOf(',') : -1;
        resolve(commaIndex > -1 ? dataUrl.slice(commaIndex + 1) : dataUrl);
      };
      reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));
      reader.readAsDataURL(file);
    });

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (files.length === 0) {
      return;
    }

    if (files.some((file) => !file.type.startsWith('image/'))) {
      setError('Only image files are allowed.');
      return;
    }

    if (files.some((file) => file.size > 10 * 1024 * 1024)) {
      setError('Each image must be 10MB or less.');
      return;
    }

    if (form.attachments.length + files.length > 5) {
      setError('You can upload up to 5 images.');
      return;
    }

    try {
      const converted = await Promise.all(
        files.map(async (file) => ({
          fileName: file.name,
          contentType: file.type,
          dataBase64: await fileToBase64(file)
        }))
      );

      setForm((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...converted]
      }));
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to process selected files.');
    }
  };

  const removeAttachment = (index) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    if (!form.description.trim()) return 'Description is required.';
    if (form.description.trim().length > 1200) return 'Description must be 1200 characters or less.';
    if (!form.location.trim()) return 'Location is required.';
    if (!form.category.trim()) return 'Category is required.';
    if (!form.contactEmail.trim()) return 'Contact email is required.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.contactEmail.trim())) return 'Enter a valid contact email.';

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');

    await onSubmit({
      description: form.description.trim(),
      location: form.location.trim(),
      category: form.category.trim(),
      priority: form.priority,
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      attachments: form.attachments
    });
  };

  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Ticket form">
      <div className="modal-card ticket-modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="secondary-btn" onClick={onClose}>Close</button>
        </div>

        <form className="ticket-form" onSubmit={handleSubmit}>
          <label>
            Description *
            <textarea
              className="text-input"
              rows={4}
              value={form.description}
              onChange={(event) => setField('description', event.target.value)}
              placeholder="Describe the issue in detail..."
              required
            />
          </label>

          <div className="ticket-form-grid">
            <label>
              Location *
              <input
                className="text-input"
                value={form.location}
                onChange={(event) => setField('location', event.target.value)}
                placeholder="e.g., Building A, Floor 2"
                required
              />
            </label>

            <label>
              Category *
              <select
                className="text-input"
                value={form.category}
                onChange={(event) => setField('category', event.target.value)}
              >
                <option value="IT">IT</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Safety">Safety</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label>
              Priority *
              <select
                className="text-input"
                value={form.priority}
                onChange={(event) => setField('priority', event.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </label>

            <label>
              Contact Email *
              <input
                className="text-input"
                type="email"
                value={form.contactEmail}
                onChange={(event) => setField('contactEmail', event.target.value)}
                required
              />
            </label>

            <label>
              Contact Phone
              <input
                className="text-input"
                value={form.contactPhone}
                onChange={(event) => setField('contactPhone', event.target.value)}
              />
            </label>
          </div>

          <div className="ticket-attachments">
            <label htmlFor="ticket-files" className="secondary-btn">Upload Images</label>
            <input
              id="ticket-files"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              style={{ display: 'none' }}
            />
            <p className="muted-text">Upload up to 5 images (PNG/JPG/JPEG/WebP), max 10MB each.</p>

            {attachmentPreview.length > 0 && (
              <div className="ticket-attachment-grid">
                {attachmentPreview.map((attachment, index) => (
                  <div key={attachment.key} className="ticket-attachment-item">
                    <img src={attachment.previewSrc} alt={attachment.fileName} />
                    <div>
                      <p>{attachment.fileName}</p>
                      <button type="button" className="text-btn" onClick={() => removeAttachment(index)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          <div className="ticket-modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TicketFormModal;
