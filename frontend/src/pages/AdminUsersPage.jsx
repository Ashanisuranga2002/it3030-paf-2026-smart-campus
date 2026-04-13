import { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import {
  createUser,
  deleteUser,
  getAllUsers,
  updateUser
} from '../services/userManagementService';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'USER',
  active: true
};

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const payload = {
      name: form.name,
      email: form.email,
      role: form.role,
      active: form.active
    };

    if (form.password.trim()) {
      payload.password = form.password;
    }

    try {
      if (editingId) {
        await updateUser(editingId, payload);
      } else {
        if (!payload.password) {
          setError('Password is required to create a user');
          return;
        }
        await createUser(payload);
      }
      resetForm();
      await loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save user');
    }
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      active: user.active
    });
  };

  const onDelete = async (id) => {
    try {
      await deleteUser(id);
      await loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div>
      <Navbar />

      <div className="page-container admin-users-page">
        <div className="card">
          <h1>User Management (Admin)</h1>
          <p>Create, update, delete users and manage roles.</p>

          <form className="user-form" onSubmit={onSubmit}>
            <input
              className="text-input"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={onChange}
              required
            />
            <input
              className="text-input"
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={onChange}
              required
            />
            <input
              className="text-input"
              name="password"
              type="password"
              placeholder={editingId ? 'New password (optional)' : 'Password'}
              value={form.password}
              onChange={onChange}
            />
            <select className="text-input" name="role" value={form.role} onChange={onChange}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="TECHNICIAN">TECHNICIAN</option>
            </select>

            <label className="checkbox-row">
              <input type="checkbox" name="active" checked={form.active} onChange={onChange} />
              Active
            </label>

            {error ? <p className="error-text">{error}</p> : null}

            <div className="action-row">
              <button className="primary-btn" type="submit">
                {editingId ? 'Update User' : 'Create User'}
              </button>
              {editingId ? (
                <button className="secondary-btn" type="button" onClick={resetForm}>
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="card">
          <h2>All Users</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.active ? 'Yes' : 'No'}</td>
                    <td className="table-actions">
                      <button className="small-btn" onClick={() => startEdit(user)}>Edit</button>
                      <button className="secondary-btn" onClick={() => onDelete(user.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUsersPage;
