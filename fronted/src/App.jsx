import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import Layout from './components/comunes/Layout/Layout';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import Users from './pages/Users/Users';
import Budgets from './pages/Budgets/Budgets';
import Audit from './pages/Audit/Audit';
import Expenses from './pages/Expenses/Expenses';
import Income from './pages/Income/Income';
import Roles from './pages/Roles/Roles';
import GeneratePass from './pages/Security/GeneratePass/GeneratePass';
import Scanner from './pages/Security/Scanner/Scanner';
import Houses from './pages/Houses/Houses';
import Providers from './pages/Providers/Providers';
import LoadingSpinner from './components/comunes/LoadingSpinner/LoadingSpinner';
import './App.module.css';

/**
 * Componente para proteger rutas privadas
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) return <LoadingSpinner fullScreen />;

  return isAuthenticated ? children : <Navigate to="/login" />;
};

/**
 * Componente principal de la aplicación
 * Configura el enrutamiento y el contexto global
 */
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Rutas Privadas */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            }
          />
          <Route
            path="/presupuesto"
            element={
              <PrivateRoute>
                <Budgets />
              </PrivateRoute>
            }
          />
          <Route
            path="/egresos"
            element={
              <PrivateRoute>
                <Expenses />
              </PrivateRoute>
            }
          />
          <Route
            path="/ingresos"
            element={
              <PrivateRoute>
                <Income />
              </PrivateRoute>
            }
          />
          <Route
            path="/seguridad/generar"
            element={
              <PrivateRoute>
                <GeneratePass />
              </PrivateRoute>
            }
          />
          <Route
            path="/seguridad/escanear"
            element={
              <PrivateRoute>
                <Scanner />
              </PrivateRoute>
            }
          />
          <Route
            path="/auditoria"
            element={
              <PrivateRoute>
                <Audit />
              </PrivateRoute>
            }
          />

          <Route
            path="/roles"
            element={
              <PrivateRoute>
                <Roles />
              </PrivateRoute>
            }
          />

          <Route
            path="/viviendas"
            element={
              <PrivateRoute>
                <Houses />
              </PrivateRoute>
            }
          />

          <Route
            path="/proveedores"
            element={
              <PrivateRoute>
                <Providers />
              </PrivateRoute>
            }
          />
          {/* Redirección por defecto*/}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
