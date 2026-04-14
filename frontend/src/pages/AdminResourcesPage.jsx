import { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import {
  createResource,
  deleteResource,
  getAdminResources,
  updateResource
} from '../services/adminResourceService';

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
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadResources = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminResources({ search });
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

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      if (editingId) {
        await updateResource(editingId, form);
      } else {
        await createResource(form);
      }
      resetForm();
      await loadResources();
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
    <div className="page-wrapper">
      <Navbar />

      <div className="page-container admin-resources-page">
        <section className="card">
          <h1>Resource Management</h1>
          <p>Create, update, and delete campus resources.</p>

          <form className="admin-resource-form" onSubmit={onSubmit}>
            <input className="text-input" name="name" value={form.name} onChange={onChange} placeholder="Resource name" required />
            <input className="text-input" name="location" value={form.location} onChange={onChange} placeholder="Location" required />
            <input className="text-input" name="capacity" type="number" min={1} value={form.capacity} onChange={onChange} placeholder="Capacity" required />
            <input className="text-input" name="imageUrl" value={form.imageUrl} onChange={onChange} placeholder="Image URL (optional)" />
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
              {resources.map((resource) => (
                <article key={resource.id} className="admin-resource-item">
                  <div>
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
    </div>
  );
}

export default AdminResourcesPage;
