import React, { useState } from 'react';
import Home from './pages/Home';
import InfoPage from './pages/Info';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'info'>('home');

  return (
    <>
      {currentPage === 'home' ? (
        <Home onNavigate={() => setCurrentPage('info')} />
      ) : (
        <InfoPage onNavigate={() => setCurrentPage('home')} />
      )}
    </>
  );
}
