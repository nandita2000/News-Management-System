import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css'; // Import a separate CSS file for better styling

function LoginForm({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/auth/login', {
                username,
                password,
            });
            if (response.data && response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
                onLoginSuccess();
                navigate('/dashboard');
            }
        } catch (error) {
            if (error.response) {
                setError(error.response.data.detail || 'Login failed');
            } else {
                setError('Network error occurred');
            }
        }
    };

    return (
        <div className="login-page">
            <div className="form-container">
                <h2>Login</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Login</button>
                </form>
                <p>
                    Don't have an account? <a href="/signup">Sign up</a>
                </p>
            </div>
        </div>
    );
}

export default LoginForm;
