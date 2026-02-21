import { useState, useEffect, useCallback } from 'react';
import { userApi } from './services/api';
import UserCard from './components/UserCard';
import UserForm from './components/UserForm';
import './App.css';

function App() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await userApi.getAll();
            setUsers(data.Items || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleCreate = () => {
        setEditingUser(null);
        setShowForm(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingUser(null);
    };

    const handleSubmit = async (formData) => {
        try {
            setIsSubmitting(true);
            if (editingUser) {
                const { userId, ...updateData } = formData;
                await userApi.update(userId, updateData);
                showNotification('User updated successfully!');
            } else {
                await userApi.create(formData);
                showNotification('User created successfully!');
            }
            handleCloseForm();
            fetchUsers();
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            setDeletingId(userId);
            await userApi.delete(userId);
            showNotification('User deleted successfully!');
            fetchUsers();
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="app">
            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <header className="app-header">
                <div className="header-content">
                    <h1>User Management</h1>
                    <p>Manage your users with AWS Serverless CRUD</p>
                </div>
                <button className="btn btn-primary" onClick={handleCreate}>
                    + Add User
                </button>
            </header>

            <main className="app-main">
                {loading && (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Loading users...</p>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                        <button className="btn btn-secondary" onClick={fetchUsers}>
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && users.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">👤</div>
                        <h2>No users yet</h2>
                        <p>Get started by creating your first user</p>
                        <button className="btn btn-primary" onClick={handleCreate}>
                            Create User
                        </button>
                    </div>
                )}

                {!loading && !error && users.length > 0 && (
                    <div className="users-grid">
                        {users.map((user) => (
                            <UserCard
                                key={user.userId}
                                user={user}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                isDeleting={deletingId === user.userId}
                            />
                        ))}
                    </div>
                )}
            </main>

            {showForm && (
                <UserForm
                    user={editingUser}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseForm}
                    isLoading={isSubmitting}
                />
            )}
        </div>
    );
}

export default App;
