import { useState, useEffect } from 'react';

const UserForm = ({ user, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState({
        userId: '',
        email: '',
        fullName: '',
        status: 'active',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                userId: user.userId || '',
                email: user.email || '',
                fullName: user.fullName || '',
                status: user.status || 'active',
            });
        }
    }, [user]);

    const validate = () => {
        const newErrors = {};
        if (!formData.userId.trim()) newErrors.userId = 'User ID is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    const isEditMode = !!user;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>{isEditMode ? 'Edit User' : 'Create New User'}</h2>
                    <button className="close-btn" onClick={onCancel}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="user-form">
                    <div className="form-group">
                        <label htmlFor="userId">User ID</label>
                        <input
                            type="text"
                            id="userId"
                            name="userId"
                            value={formData.userId}
                            onChange={handleChange}
                            disabled={isEditMode}
                            placeholder="e.g., e001"
                        />
                        {errors.userId && <span className="error">{errors.userId}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="user@example.com"
                        />
                        {errors.email && <span className="error">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="John Doe"
                        />
                        {errors.fullName && <span className="error">{errors.fullName}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? 'Saving...' : (isEditMode ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;
