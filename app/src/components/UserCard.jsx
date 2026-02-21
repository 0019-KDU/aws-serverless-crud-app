const UserCard = ({ user, onEdit, onDelete, isDeleting }) => {
    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'status-active';
            case 'inactive': return 'status-inactive';
            case 'pending': return 'status-pending';
            default: return '';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="user-card">
            <div className="user-card-header">
                <div className="user-avatar">
                    {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="user-info">
                    <h3 className="user-name">{user.fullName}</h3>
                    <span className={`user-status ${getStatusClass(user.status)}`}>
                        {user.status}
                    </span>
                </div>
            </div>

            <div className="user-card-body">
                <div className="user-detail">
                    <span className="label">ID:</span>
                    <span className="value">{user.userId}</span>
                </div>
                <div className="user-detail">
                    <span className="label">Email:</span>
                    <span className="value">{user.email}</span>
                </div>
                <div className="user-detail">
                    <span className="label">Created:</span>
                    <span className="value">{formatDate(user.createdAt)}</span>
                </div>
                <div className="user-detail">
                    <span className="label">Updated:</span>
                    <span className="value">{formatDate(user.updatedAt)}</span>
                </div>
            </div>

            <div className="user-card-actions">
                <button
                    className="btn btn-edit"
                    onClick={() => onEdit(user)}
                >
                    Edit
                </button>
                <button
                    className="btn btn-delete"
                    onClick={() => onDelete(user.userId)}
                    disabled={isDeleting}
                >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    );
};

export default UserCard;
