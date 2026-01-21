// src/components/Footer.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../App.css";

export default function Footer({ user }) {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  const showNevjegyLink = !!user && !isAuthPage;

  return (
    <footer className="app-footer">
      <p>© {new Date().getFullYear()} GameVerse</p>

      {/* ez MINDIG látszik, bejelentkezéstől függetlenül */}
      <p>Készítette: Kiss Csaba &amp; Kormos Levente</p>

      {/* ez CSAK bejelentkezve, és nem login/reg oldalon */}
      {showNevjegyLink && (
        <p>
          <Link to="/nevjegy" className="footer-link">
            Névjegy &amp; kapcsolat
          </Link>
        </p>
      )}
    </footer>
  );
}
