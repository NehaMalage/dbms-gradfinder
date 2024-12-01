import React, { useState } from 'react';
import axios from 'axios'; // Import axios for API calls
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Signup.css';

const Signup = () => {
  const [user_type, setUser_type] = useState('user'); // User type state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    identificationCode: '',
  });
  const [loading, setLoading] = useState(false); // State for showing loader
  const [showRedirectButton, setShowRedirectButton] = useState(false); // State for showing redirect button
  const navigate = useNavigate(); // Initialize navigation

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'user_type') {
      setUser_type(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setLoading(true); // Show loading indicator

    try {
      const response = await axios.post(
        'http://localhost:8080/api/signup',
        { ...formData, user_type }, // Include user_type in payload
        { withCredentials: true } // Include credentials (if required)
      );

      console.log('Response:', response.data); // Log success
      alert('Registration submitted successfully!');
      setShowRedirectButton(true); // Show redirect button on success
    } catch (error) {
      console.error(
        'Signup failed:',
        error.response ? error.response.data : error.message
      );
      alert(
        'Registration failed: ' +
          (error.response ? error.response.data.message : 'Server error')
      );
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>

      {/* User Type Selector */}
      <div className="user-type-selector">
        <label>
          <input
            type="radio"
            name="user_type"
            value="user"
            checked={user_type === 'user'}
            onChange={handleChange}
          />
          User
        </label>
        <label>
          <input
            type="radio"
            name="user_type"
            value="admin"
            checked={user_type === 'admin'}
            onChange={handleChange}
          />
          Admin
        </label>
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSignup}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
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
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        {/* Show Identification Code field for Admin */}
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

        {/* Submit Button */}
        <button type="submit" className="signup-button" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>

      {/* Redirect to Home Button */}
      {showRedirectButton && (
        <button
          onClick={() => navigate('/')}
          className="redirect-button"
        >
          Go to Home
        </button>
      )}
    </div>
  );
};

export default Signup;
