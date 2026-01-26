import React from "react";
import { Link } from "react-router-dom";
import ProfessionalGameUpload from "../components/ProfessionalGameUpload.jsx";

const GameDevUpload = ({ user }) => {
  const handleGameUploaded = (gameData) => {
    console.log("Game uploaded successfully:", gameData);
  };

  return (
    <div className="maincenter">
      <nav>
        <Link to="/" className="nav-link">Főoldal</Link>
        <Link to="/statistics" className="nav-link">Statisztikák</Link>
        <Link to="/system-requirements" className="nav-link">Rendszerkövetelmények</Link>
        <Link to="/profile" className="nav-link">Profil</Link>
        <Link to="/nevjegy" className="nav-link">Névjegy</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className="nav-link">Admin Panel</Link>
        )}
        {(user?.role === 'gamedev' || user?.role === 'admin') && (
          <Link to="/gamedev-upload" className="nav-link active">Játék Feltöltés</Link>
        )}
      </nav>

      <ProfessionalGameUpload 
        user={user}
        onGameUploaded={handleGameUploaded}
      />
    </div>
  );
};

export default GameDevUpload;
