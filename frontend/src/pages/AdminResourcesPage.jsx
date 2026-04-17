import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  createResource,
  deleteResource,
  getAdminResources,
  updateResource
} from '../services/adminResourceService';
import { buildResourceImageDataUrl, getResourceImageUrl } from '../utils/resourceImage';

const typeOptions = ['AUDITORIUM', 'LAB', 'CLASSROOM', 'MEETING_ROOM', 'LIBRARY', 'SPORTS'];
const statusOptions = ['ACTIVE', 'OUT_OF_SERVICE'];

const emptyForm = {
  name: '',
  description: '',
  location: '',
  capacity: 1,
  imageUrl: '',
  type: 'LAB',
  status: 'ACTIVE'
};

function AdminResourcesPage() {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFileName, setImageFileName] = useState('');

  const loadResources = async (searchOverride) => {
    setLoading(true);
    setError('');
    const effectiveSearch = typeof searchOverride === 'string' ? searchOverride : search;
    try {
      const data = await getAdminResources({ search: effectiveSearch });
      setResources(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [search]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? Number(value) : value
    }));
  };

  const applyAutoImage = () => {
    setForm((prev) => ({
      ...prev,
      imageUrl: buildResourceImageDataUrl(prev.name, prev.type)
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFileName('');
  };

  const onImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        imageUrl: String(reader.result || '')
      }));
      setImageFileName(file.name);
      setError('');
    };
    reader.onerror = () => {
      setError('Failed to read selected image file.');
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await updateResource(editingId, form);
        setSuccess('Resource updated successfully.');
        await loadResources();
      } else {
        await createResource(form);
        setSearch('');
        setSuccess('Resource created successfully.');
        await loadResources('');
      }
      resetForm();
    } catch (err) {
      const serverError = err?.response?.data;
      if (serverError?.errors) {
        const firstError = Object.values(serverError.errors)[0];
        setError(firstError || 'Validation failed');
      } else {
        setError(serverError?.message || 'Failed to save resource');
      }
    }
  };

  const startEdit = (resource) => {
    setEditingId(resource.id);
    setForm({
      name: resource.name,
      description: resource.description,
      location: resource.location,
      capacity: resource.capacity,
      imageUrl: resource.imageUrl || '',
      type: resource.type,
      status: resource.status
    });
    setImageFileName('');
  };

  const onDelete = async (id) => {
    setError('');
    try {
      await deleteResource(id);
      if (editingId === id) {
        resetForm();
      }
      await loadResources();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete resource');
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container admin-resources-page">
        <section className="card">
          <h1>Resource Management</h1>
          <p>Create, update, and delete campus resources.</p>

          <form className="admin-resource-form" onSubmit={onSubmit}>
            <input className="text-input" name="name" value={form.name} onChange={onChange} placeholder="Resource name" required />
            <input className="text-input" name="location" value={form.location} onChange={onChange} placeholder="Location" required />
            <input className="text-input" name="capacity" type="number" min={1} value={form.capacity} onChange={onChange} placeholder="Capacity" required />
            <input className="text-input" name="imageUrl" value={form.imageUrl} onChange={onChange} placeholder="Image URL (optional)" />
            <label className="admin-resource-file-picker">
              <span className="profile-field-label">Upload Image</span>
              <input type="file" accept="image/*" onChange={onImageFileChange} />
              {imageFileName ? <span className="muted-text">Selected: {imageFileName}</span> : null}
            </label>
            <div className="admin-resource-image-tools">
              <button type="button" className="secondary-btn" onClick={applyAutoImage}>Generate Image From Name</button>
              <span className="muted-text">Admins can paste an image URL or generate an image from resource name/type.</span>
            </div>
            <div className="admin-resource-image-preview-wrap">
              <img
                className="admin-resource-image-preview"
                src={form.imageUrl?.trim() ? form.imageUrl : buildResourceImageDataUrl(form.name, form.type)}
                alt="Resource preview"
              />
            </div>
            <select className="text-input" name="type" value={form.type} onChange={onChange}>
              {typeOptions.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select className="text-input" name="status" value={form.status} onChange={onChange}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <textarea className="text-input" name="description" value={form.description} onChange={onChange} placeholder="Description" rows={4} required />

            {error ? <p className="error-text">{error}</p> : null}
            {success ? <p className="success-text">{success}</p> : null}

            <div className="action-row">
              <button className="primary-btn" type="submit">{editingId ? 'Update Resource' : 'Create Resource'}</button>
              {editingId ? <button className="secondary-btn" type="button" onClick={resetForm}>Cancel Edit</button> : null}
            </div>
          </form>
        </section>

        <section className="card">
          <div className="admin-resource-list-head">
            <h2>All Resources</h2>
            <input
              className="text-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources"
            />
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="admin-resource-list">
              {resources.length === 0 ? <p className="muted-text">No resources found for the current search.</p> : null}
              {resources.map((resource) => (
                <article key={resource.id} className="admin-resource-item">
                  <div>
                    <img className="admin-resource-list-image" src={getResourceImageUrl(resource)} alt={resource.name} />
                    <h3>{resource.name}</h3>
                    <p>{resource.description}</p>
                    <small>{resource.location} | {resource.type} | Capacity: {resource.capacity}</small>
                  </div>
                  <div className="table-actions">
                    <button className="small-btn" onClick={() => startEdit(resource)}>Edit</button>
                    <button className="secondary-btn" onClick={() => onDelete(resource.id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

export default AdminResourcesPage;
