import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">

      <header className="hero-section">
        <h1>Welcome to GradFinder</h1>
        <p>Your one-stop solution to find your ideal Master's College</p>
        <a href="/search" className="btn">Find Colleges</a>
      </header>

    </div>
  );
};

export default Home;
