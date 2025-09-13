import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Login.module.css';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const quickLogin = (email, password) => {
        setFormData({ email, password });
    };

    return (
        <div className={styles.container}>
            <div className={styles.background}>
                <div className={styles.shape1}></div>
                <div className={styles.shape2}></div>
                <div className={styles.shape3}></div>
            </div>

            <div className={styles.content}>
                <div className={styles.brand}>
                    <div className={styles.logo}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1>NotesApp</h1>
                    <p>Multi-tenant SaaS Platform</p>
                </div>

                <div className={styles.card}>
                    <div className={styles.header}>
                        <h2>Welcome Back</h2>
                        <p>Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
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

                        <div className={styles.field}>
                            <label htmlFor="email">Email Address</label>
                            <div className={styles.inputWrapper}>
                                <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" />
                                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your email"
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="password">Password</label>
                            <div className={styles.inputWrapper}>
                                <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="12" cy="16" r="1" fill="currentColor" />
                                    <path d="M7 11V7A5 5 0 0 1 17 7V11" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your password"
                                    className={styles.input}
                                />
                                <button
                                    type="button"
                                    className={styles.togglePassword}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5.93 20 1.07 15.07 1.07 9S5.93-2 12-2C18.07-2 22.93 2.93 22.93 9C22.93 11.5 22.07 13.8 20.6 15.6" stroke="currentColor" strokeWidth="2" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4C18.07 4 22.93 8.93 22.93 15S18.07 26 12 26C5.93 26 1.07 21.07 1.07 15C1.07 12.5 1.93 10.2 3.4 8.4" stroke="currentColor" strokeWidth="2" />
                                            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" />
                                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className={styles.spinner} width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className={styles.spinnerCircle} />
                                        <path d="M4 12A8 8 0 0 1 12 4" stroke="currentColor" strokeWidth="4" className={styles.spinnerPath} />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M15 3H19A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H15" stroke="currentColor" strokeWidth="2" />
                                        <polyline points="10,17 15,12 10,7" stroke="currentColor" strokeWidth="2" />
                                        <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className={styles.divider}>
                        <span>or</span>
                    </div>

                    <div className={styles.quickLogin}>
                        <h4>Quick Login (Test Accounts)</h4>
                        <div className={styles.testButtons}>
                            <button
                                type="button"
                                className={styles.testButton}
                                onClick={() => quickLogin('admin@acme.test', 'password')}
                            >
                                <span className={styles.testButtonText}>Acme Admin</span>
                                <span className={styles.testButtonSubtext}>admin@acme.test</span>
                            </button>
                            <button
                                type="button"
                                className={styles.testButton}
                                onClick={() => quickLogin('user@acme.test', 'password')}
                            >
                                <span className={styles.testButtonText}>Acme User</span>
                                <span className={styles.testButtonSubtext}>user@acme.test</span>
                            </button>
                            <button
                                type="button"
                                className={styles.testButton}
                                onClick={() => quickLogin('admin@globex.test', 'password')}
                            >
                                <span className={styles.testButtonText}>Globex Admin</span>
                                <span className={styles.testButtonSubtext}>admin@globex.test</span>
                            </button>
                            <button
                                type="button"
                                className={styles.testButton}
                                onClick={() => quickLogin('user@globex.test', 'password')}
                            >
                                <span className={styles.testButtonText}>Globex User</span>
                                <span className={styles.testButtonSubtext}>user@globex.test</span>
                            </button>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <p>
                            Don't have an account?{' '}
                            <Link to="/register" className={styles.link}>
                                Create one here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
