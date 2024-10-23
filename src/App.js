import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import GameCenter from './pages/GameCenter.js';

function App() {
  return (
    <div className="App">
      <Router>
        <GameCenter />
      </Router>
    </div>
  );
}

export default App;
