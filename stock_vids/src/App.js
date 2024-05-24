import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Favicon from "react-favicon";

import Login from './components/Views/Login/Login.jsx'
import Register from './components/Views/Register/Register.jsx'
import Home from './components/Views/Home/Home.jsx'
import Random from './components/Views/Random/Random.jsx';
import Watchlist from './components/Views/Watchlist/Watchlist.jsx';
import Navbar from './components/Views/Navbar/Navbar.jsx'
import ContentView from './components/Views/ContentView/ContentView.jsx';
import Loading from './components/Views/Loading/Loading.jsx';
import AddMovie from './components/Views/AddMovie/AddMovie.jsx';
import ResetPassword from './components/Views/ResetPassword/ResetPassword.jsx';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [contentView, setContentView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("home");

  const favicon = "https://www.itgwebb.se/klass/webb2/august/favicon.ico";

  let current_zoom_level;

  function calculate_zoom_level() {
    const width_ratio = window.outerWidth / window.innerWidth;
    const height_ratio = window.outerHeight / window.innerHeight;

    const zoom_factor = (width_ratio + height_ratio) / 2;
    const rounded_zoom_factor = Math.round(zoom_factor * 100) / 100;

    return rounded_zoom_factor;
  }

  function update_zoom_level() {
    const new_zoom_level = calculate_zoom_level();
    if (new_zoom_level !== current_zoom_level) {
      current_zoom_level = new_zoom_level;
      const vh_rem_value = `${(window.innerHeight / 100) * new_zoom_level}px`;
      console.log(`Zoom level: ${current_zoom_level}, --vh-rem: ${vh_rem_value}`);
    }
  }

  window.addEventListener('resize', update_zoom_level);

  update_zoom_level();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
    if (window.location.pathname === "/login" || window.location.pathname === "/register") {
      setIsLoggedIn(false);
    }
    if (window.location.pathname === "/") {
      window.location.href = "/login";
    }
  }, []);

  return (
    <Router>
      <Favicon url={favicon} />
      <link rel="icon" href="images/favicon.ico" type="image/x-icon" />
      {isLoading ? <Loading setIsLoading={setIsLoading} />
        :
        <div>
          {isLoggedIn && window.location.pathname !== "/login" && window.location.pathname !== "/add" && <Navbar setIsLoggedIn={setIsLoggedIn} setIsSearching={setIsSearching} selectedIcon={selectedIcon} setSelectedIcon={setSelectedIcon} />}
          <Routes>
            {!isLoggedIn && <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} />} />}
            {!isLoggedIn && <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />}
            {!isLoggedIn && <Route path="/reset-password" element={<ResetPassword />} />}
            {isLoggedIn && !isSearching && selectedIcon === "home" && <Route path="/home" element={<Home setIsLoggedIn={setIsLoggedIn} />} />}
            {isLoggedIn && !isSearching && selectedIcon === "random" && <Route path="/home" element={<Random />} />}
            {isLoggedIn && !isSearching && selectedIcon === "watchlist" && <Route path="/home" element={<Watchlist />} />}
            {isLoggedIn && contentView && <Route path="/content" element={<ContentView />} />}
            {isLoggedIn && isSearching && <Route path="/search" element={<Home setIsLoggedIn={setIsLoggedIn} />} />}
            {isLoggedIn && <Route path="/add" element={<AddMovie />} />}
          </Routes>
        </div>
      }
    </Router>
  );
};

export default App;
