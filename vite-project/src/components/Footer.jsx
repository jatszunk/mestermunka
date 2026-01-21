// src/components/Footer.jsx
import React from "react";
import "../App.css";

export default function Footer() {
  return (
    <footer className="app-footer">
      <p>© {new Date().getFullYear()} GameVerse</p>
      <p>Készítette: Kiss Csaba & Kormos Levente</p>
    </footer>
  );
}
