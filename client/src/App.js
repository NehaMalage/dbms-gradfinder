import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './comp/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Applications from './pages/Applications';
import Search from './pages/Search'; // Import the new Search component

function App() {
  const [username, setUsername] = useState(null);

  // Check for username in localStorage on app load
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  return (
    <Router>
      <Layout username={username} setUsername={setUsername}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setUsername={setUsername} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/search" element={<Search />} /> {/* Add route for Search */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;