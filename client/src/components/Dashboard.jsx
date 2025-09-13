import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import styles from './Dashboard.module.css';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newNote, setNewNote] = useState({ title: '', content: '' });
    const [meta, setMeta] = useState({ count: 0, limit: 3, plan: 'free', canCreateMore: true });

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            const response = await apiService.getNotes();
            setNotes(response.notes);
            setMeta(response.meta);
            setError('');
        } catch (err) {
            setError('Failed to load notes');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNote = async (e) => {
        e.preventDefault();
        try {
            await apiService.createNote(newNote.title, newNote.content);
            setNewNote({ title: '', content: '' });
            setShowCreateForm(false);
            loadNotes();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create note');
        }
    };

    const handleDeleteNote = async (id) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await apiService.deleteNote(id);
                loadNotes();
            } catch (err) {
                setError('Failed to delete note');
            }
        }
    };

    const handleUpgrade = async () => {
        try {
            await apiService.upgradeTenant(user.tenant.slug);
            alert('Successfully upgraded to Pro plan!');
            loadNotes(); // Reload to get updated meta
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to upgrade');
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className={styles.spinnerCircle} />
                        <path d="M4 12A8 8 0 0 1 12 4" stroke="currentColor" strokeWidth="4" className={styles.spinnerPath} />
                    </svg>
                </div>
                <p>Loading your notes...</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.brand}>
                        <div className={styles.logo}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <h1>NotesApp</h1>
                            <p>Multi-tenant SaaS Platform</p>
                        </div>
                    </div>

                    <div className={styles.userSection}>
                        <div className={styles.userInfo}>
                            <div className={styles.userDetails}>
                                <span className={styles.userEmail}>{user.email}</span>
                                <div className={styles.tenantInfo}>
                                    <span className={styles.tenantName}>{user.tenant.name}</span>
                                    <span className={`${styles.plan} ${styles[user.tenant.plan]}`}>
                                        {user.tenant.plan.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.userRole}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 0 4 19V21" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                {user.role}
                            </div>
                        </div>
                        <button onClick={logout} className={styles.logoutButton}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M9 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H9" stroke="currentColor" strokeWidth="2" />
                                <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" />
                                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                {error && (
                    <div className={styles.error}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" />
                            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        {error}
                    </div>
                )}

                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" />
                                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" />
                                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" />
                                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" />
                                <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <div className={styles.statContent}>
                            <h3>{meta.count}</h3>
                            <p>Total Notes</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" />
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" />
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <div className={styles.statContent}>
                            <h3>{meta.plan.toUpperCase()}</h3>
                            <p>Current Plan</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <path d="M8 12L10.5 14.5L16 9" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <div className={styles.statContent}>
                            <h3>{meta.canCreateMore ? '∞' : meta.limit - meta.count}</h3>
                            <p>Notes Remaining</p>
                        </div>
                    </div>
                </div>

                <div className={styles.notesSection}>
                    <div className={styles.notesHeader}>
                        <h2>Your Notes</h2>
                        <div className={styles.actions}>
                            {user.role === 'admin' && user.tenant.plan === 'free' && (
                                <button onClick={handleUpgrade} className={styles.upgradeButton}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" />
                                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" />
                                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    Upgrade to Pro
                                </button>
                            )}
                            <button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                className={styles.createButton}
                                disabled={!meta.canCreateMore}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" />
                                    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                {showCreateForm ? 'Cancel' : 'Create Note'}
                            </button>
                        </div>
                    </div>

                    {!meta.canCreateMore && (
                        <div className={styles.limitWarning}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
                                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            <span>You've reached your note limit. Upgrade to Pro for unlimited notes!</span>
                        </div>
                    )}

                    {showCreateForm && (
                        <form onSubmit={handleCreateNote} className={styles.createForm}>
                            <div className={styles.formHeader}>
                                <h3>Create New Note</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className={styles.closeButton}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" />
                                        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </button>
                            </div>
                            <div className={styles.formFields}>
                                <input
                                    type="text"
                                    placeholder="Note title"
                                    value={newNote.title}
                                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                    required
                                    className={styles.titleInput}
                                />
                                <textarea
                                    placeholder="Write your note content here..."
                                    value={newNote.content}
                                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                    rows="6"
                                    className={styles.contentInput}
                                />
                            </div>
                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setShowCreateForm(false)} className={styles.cancelButton}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.saveButton}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H16L21 8V19A2 2 0 0 1 19 21Z" stroke="currentColor" strokeWidth="2" />
                                        <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" strokeWidth="2" />
                                        <polyline points="7,3 7,8 15,8" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    Save Note
                                </button>
                            </div>
                        </form>
                    )}

                    <div className={styles.notesList}>
                        {notes.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                        <path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" />
                                        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" />
                                        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" />
                                        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" />
                                        <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </div>
                                <h3>No notes yet</h3>
                                <p>Create your first note to get started!</p>
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className={styles.createFirstButton}
                                    disabled={!meta.canCreateMore}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" />
                                        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    Create Your First Note
                                </button>
                            </div>
                        ) : (
                            notes.map((note) => (
                                <div key={note._id} className={styles.noteCard}>
                                    <div className={styles.noteHeader}>
                                        <h3>{note.title}</h3>
                                        <button
                                            onClick={() => handleDeleteNote(note._id)}
                                            className={styles.deleteButton}
                                            title="Delete note"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" />
                                                <path d="M19,6V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V6M8,6V4A2,2 0 0,1 10,2H14A2,2 0 0,1 16,4V6" stroke="currentColor" strokeWidth="2" />
                                                <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" />
                                                <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className={styles.noteContent}>
                                        <p>{note.content || 'No content'}</p>
                                    </div>
                                    <div className={styles.noteMeta}>
                                        <div className={styles.noteAuthor}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                <path d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 0 4 19V21" stroke="currentColor" strokeWidth="2" />
                                                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                            {note.author_email}
                                        </div>
                                        <div className={styles.noteDate}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
                                                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" />
                                                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                            {new Date(note.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
