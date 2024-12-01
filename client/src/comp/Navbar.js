import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ username, setUsername }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUsername(null); // Clear username from state
    localStorage.removeItem('username'); // Remove username from localStorage
    navigate('/login'); // Redirect to login page
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="/">
          <img src="/images/logo.png" alt="GradFinder Logo" className="logo" />
        </a>
        <h1>GradFinder</h1>
      </div>
      <ul className="navbar-menu">
        <li><a href="/search">Find Colleges</a></li>
        <li><a href="/applications">Track Applications</a></li>
        {username ? (
          <>
            <li><span className="welcome">Welcome, {username}</span></li>
            <li>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </li>
          </>
        ) : (
          <li><a href="/login">Login</a></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
