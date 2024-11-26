import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './components/MainPage';  // Main page layout with buttons
import Settings from './components/Settings';  // Settings page
import Placeholder from './components/Placeholder';  // Placeholder pages

const App = () => {
  return (
    <Router>
      <div className="App">
        {/* Define routes to different components */}
        <Routes>
          <Route path="/" element={<MainPage />} />  {/* Main Page */}
          <Route path="/settings" element={<Settings />} />  {/* Settings Page */}
          <Route path="/placeholder1" element={<Placeholder />} />
          <Route path="/placeholder2" element={<Placeholder />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
