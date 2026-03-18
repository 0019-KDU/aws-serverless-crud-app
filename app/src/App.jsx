import { useState, useEffect, useCallback } from 'react';
import { useAuth } from 'react-oidc-context';
import { userApi, setAccessToken } from './services/api';
import UserCard from './components/UserCard';
import UserForm from './components/UserForm';
import './App.css';

function App() {
    const auth = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [notification, setNotification] = useState(null);

    const signOutRedirect = () => {
        const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
        const logoutUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
        const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
        // Clear token before redirect
        setAccessToken(null);
        auth.removeUser();
        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    };

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
        if (auth.isAuthenticated && auth.user?.access_token) {
            setAccessToken(auth.user.id_token);
            fetchUsers();
        }
    }, [auth.isAuthenticated, auth.user?.access_token, fetchUsers]);

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

    // Loading state
    if (auth.isLoading) {
        return (
            <div className="app">
                <div className="auth-container">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (auth.error) {
        return (
            <div className="app">
                <div className="auth-container">
                    <div className="auth-error">
                        <h2>Authentication Error</h2>
                        <p>{auth.error.message}</p>
                        <button className="btn btn-primary" onClick={() => auth.signinRedirect()}>
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Not authenticated - show login
    if (!auth.isAuthenticated) {
        return (
            <div className="app">
                <div className="auth-container">
                    <div className="login-card">
                        <div className="login-icon">🔐</div>
                        <h1>User Management</h1>
                        <p>Sign in to manage your users with AWS Serverless CRUD</p>
                        <button className="btn btn-login" onClick={() => auth.signinRedirect()}>
                            Sign in with Cognito
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Authenticated - show dashboard
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
                    <p>Welcome, {auth.user?.profile.email}</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={handleCreate}>
                        + Add User
                    </button>
                    <button className="btn btn-logout" onClick={signOutRedirect}>
                        Sign Out
                    </button>
                </div>
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
