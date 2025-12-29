import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children, userName, onRegistrar, onHome, onAdmins, userRole = 'doctor' }) => (
  <div>
    <Navbar
      userName={userName}
      onRegistrar={onRegistrar}
      onHome={onHome}
      onAdmins={onAdmins}
      userRole={userRole}
    />
    <main style={{ padding: '2rem' }}>
      {children}
    </main>
  </div>
);

export default Layout;