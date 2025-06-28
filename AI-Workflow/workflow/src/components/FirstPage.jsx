import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './FirstPage.css';

const FirstPage = () => {
  const navigate = useNavigate();

  return (
    <div className="first-page">
      <Navbar />
      
      <main className="main-content">
        <h1>Welcome to Our Website</h1>
        <p>Discover amazing features that will help you grow</p>
        <button 
          className="get-started-btn"
          onClick={() => navigate('/workflow')}
        >
          Get Started
        </button>
      </main>
    </div>
  );
};

export default FirstPage;