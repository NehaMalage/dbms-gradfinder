import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import axios for making HTTP requests
import './Login.css';

const Login = ({ setUsername }) => {
  const [user_type, setUser_type] = useState('user');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    identificationCode: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:8080/api/login',
        {
          email: formData.email,
          password: formData.password,
          user_type,
          identificationCode: user_type === 'admin' ? formData.identificationCode : undefined,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const { message, user } = response.data;
        alert(message);
        setUsername(user.username); // Set the username in state
        localStorage.setItem('username', user.username); // Persist username
        navigate('/'); // Redirect to home page
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <div className="user-type-selector">
        <label>
          <input
            type="radio"
            value="user"
            checked={user_type === 'user'}
            onChange={() => setUser_type('user')}
          />
          User
        </label>
        <label>
          <input
            type="radio"
            value="admin"
            checked={user_type === 'admin'}
            onChange={() => setUser_type('admin')}
          />
          Admin
        </label>
      </div>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {user_type === 'admin' && (
          <input
            type="text"
            name="identificationCode"
            placeholder="Identification Code"
            value={formData.identificationCode}
            onChange={handleChange}
            required
          />
        )}
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Logging In...' : 'Login'}
        </button>
      </form>

      <p>
        New here? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;
