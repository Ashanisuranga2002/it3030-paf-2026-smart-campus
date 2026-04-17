import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { updateCurrentUser } from '../services/authService';

const MAX_PROFILE_IMAGE_LENGTH = 950000;

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read selected image file.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to process selected image file.'));
    img.src = src;
  });
}

async function prepareProfileImageDataUrl(file) {
  const originalDataUrl = await fileToDataUrl(file);

  if (originalDataUrl.length <= MAX_PROFILE_IMAGE_LENGTH) {
    return originalDataUrl;
  }

  const image = await loadImage(originalDataUrl);
  const canvas = document.createElement('canvas');
  const maxDimension = 720;
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));

  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to process selected image file.');
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
  if (compressedDataUrl.length > MAX_PROFILE_IMAGE_LENGTH) {
    throw new Error('Selected image is too large. Please choose a smaller image.');
  }

  return compressedDataUrl;
}

function getInitials(name) {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [faculty, setFaculty] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setProfilePicture(user?.profilePicture || '');
    setPhoneNumber(user?.phoneNumber || '');
    setDepartment(user?.department || '');
    setFaculty(user?.faculty || '');
    setAddress(user?.address || '');
    setBio(user?.bio || '');
    setImageFileName('');
  }, [user]);

  const onProfileImageFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    try {
      const dataUrl = await prepareProfileImageDataUrl(file);
      setProfilePicture(dataUrl);
      setImageFileName(file.name);
      setError('');
    } catch (uploadError) {
      setError(uploadError.message || 'Failed to process selected image file.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateCurrentUser({
        name: name.trim(),
        profilePicture: profilePicture.trim(),
        phoneNumber: phoneNumber.trim(),
        department: department.trim(),
        faculty: faculty.trim(),
        address: address.trim(),
        bio: bio.trim()
      });
      await refreshProfile();
      setSuccess('Profile updated successfully.');
    } catch (err) {
      const backendErrors = err?.response?.data?.errors;
      const firstValidationError = backendErrors && Object.values(backendErrors)[0];
      setError(firstValidationError || err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container">
        <section className="card profile-hero fade-in">
          <div className="profile-avatar-lg">
            {user?.profilePicture
              ? <img src={user.profilePicture} alt={user?.name || 'User'} />
              : getInitials(user?.name)}
          </div>

          <div className="profile-info">
            <p className="dashboard-kicker">Profile</p>
            <h2>{user?.name || 'Campus User'}</h2>
            <p>Manage your account details and role information.</p>
          </div>
        </section>

        <section className="card">
          <h3>Account Details</h3>
          <div className="profile-fields">
            <div className="profile-field">
              <span className="profile-field-label">Full Name</span>
              <span className="profile-field-value">{user?.name || 'N/A'}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Email</span>
              <span className="profile-field-value">{user?.email || 'N/A'}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Role</span>
              <span className="profile-field-value">{user?.role || 'N/A'}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">User ID</span>
              <span className="profile-field-value">{user?.id ?? 'N/A'}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Phone Number</span>
              <span className="profile-field-value">{user?.phoneNumber || 'N/A'}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Department</span>
              <span className="profile-field-value">{user?.department || 'N/A'}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Faculty</span>
              <span className="profile-field-value">{user?.faculty || 'N/A'}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Address</span>
              <span className="profile-field-value">{user?.address || 'N/A'}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Bio</span>
              <span className="profile-field-value">{user?.bio || 'N/A'}</span>
            </div>
          </div>

          <form className="profile-edit-form" onSubmit={handleSubmit}>
            <h3>Edit Profile</h3>
            <div className="profile-fields">
              <label className="profile-field">
                <span className="profile-field-label">Display Name</span>
                <input
                  className="text-input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={255}
                  required
                />
              </label>
              <label className="profile-field">
                <span className="profile-field-label">Profile Image URL</span>
                <input
                  className="text-input"
                  value={profilePicture}
                  onChange={(event) => setProfilePicture(event.target.value)}
                  placeholder="https://..."
                  maxLength={1000}
                />
              </label>
              <label className="profile-field">
                <span className="profile-field-label">Upload Profile Image</span>
                <input type="file" accept="image/*" onChange={onProfileImageFileChange} />
                {imageFileName ? <span className="muted-text">Selected: {imageFileName}</span> : null}
              </label>
              <label className="profile-field">
                <span className="profile-field-label">Phone Number</span>
                <input
                  className="text-input"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  maxLength={30}
                  placeholder="+94 ..."
                />
              </label>
              <label className="profile-field">
                <span className="profile-field-label">Department</span>
                <input
                  className="text-input"
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  maxLength={120}
                  placeholder="Computer Science"
                />
              </label>
              <label className="profile-field">
                <span className="profile-field-label">Faculty</span>
                <input
                  className="text-input"
                  value={faculty}
                  onChange={(event) => setFaculty(event.target.value)}
                  maxLength={120}
                  placeholder="Faculty of Engineering"
                />
              </label>
              <label className="profile-field">
                <span className="profile-field-label">Address</span>
                <input
                  className="text-input"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  maxLength={255}
                  placeholder="City, Country"
                />
              </label>
              <label className="profile-field profile-field-full">
                <span className="profile-field-label">Bio</span>
                <textarea
                  className="text-input"
                  rows={4}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  maxLength={1000}
                  placeholder="Tell us about yourself"
                />
              </label>
            </div>
            {error ? <p className="error-text">{error}</p> : null}
            {success ? <p className="success-text">{success}</p> : null}
            <div className="action-row">
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default ProfilePage;
