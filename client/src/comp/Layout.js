import React from 'react';
import Navbar from './Navbar'; // Navbar component
import Footer from './Footer'; // Footer component

const Layout = ({ username, setUsername, children }) => {
  return (
    <div>
      <Navbar username={username} setUsername={setUsername} />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
