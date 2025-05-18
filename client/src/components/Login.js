import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isRegistering && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      if (isRegistering) {
        await axios.post('/api/auth/register', { email, password, confirmPassword });
        setSuccess('Registration successful! Please check your email to verify your account.');
        setIsRegistering(false);
      } else {
        const response = await axios.post('/api/auth/login', { email, password });
        localStorage.setItem('token', response.data.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          {isRegistering && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>
          )}
          <button type="submit" className="login-button">
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>
        <div className="toggle-register">
          {isRegistering ? (
            <p>Already have an account? <span onClick={() => setIsRegistering(false)}>Login</span></p>
          ) : (
            <p>Don't have an account? <span onClick={() => setIsRegistering(true)}>Register</span></p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
