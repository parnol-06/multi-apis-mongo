import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Users from "./components/Users";
import Products from "./components/Products";
import "./App.css";

export default function App() {
  return (
    <div className="container">
      <header>
        <h1>Multi APIs Client</h1>
        <p>Frontend React para Users y Products API</p>
      </header>

      {/* Navegación */}
      <nav className="navbar">
        <Link to="/" className="nav-link">
          Inicio
        </Link>
        <Link to="/users" className="nav-link">
          Usuarios
        </Link>
        <Link to="/products" className="nav-link">
          Productos
        </Link>
      </nav>

      {/* Contenido principal */}
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <div className="home">
                <h2>Bienvenido 👋</h2>
                <p>Selecciona una pestaña para gestionar datos del sistema.</p>
              </div>
            }
          />
          <Route path="/users" element={<Users />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </main>
    </div>
  );
}
