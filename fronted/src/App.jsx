import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import Layout from './components/comunes/Layout/Layout';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
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
import LoadingSpinner from './components/comunes/LoadingSpinner/LoadingSpinner';
import './App.module.css';

/**
 * Componente para proteger rutas privadas
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) return <LoadingSpinner fullScreen />;

  return isAuthenticated ? { children } : <Navigate to="/login" />;
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

          {/* Rutas Privadas */}
          <Route
            path="/"
            element={

              <Dashboard />

            }
          />
          <Route
            path="/usuarios"
            element={

              <Users />

            }
          />
          <Route
            path="/presupuesto"
            element={

              <Budgets />

            }
          />
          <Route
            path="/egresos"
            element={

              <Expenses />

            }
          />
          <Route
            path="/ingresos"
            element={

              <Income />

            }
          />
          <Route
            path="/seguridad/generar"
            element={

              <GeneratePass />

            }
          />
          <Route
            path="/seguridad/escanear"
            element={

              <Scanner />

            }
          />
          <Route
            path="/auditoria"
            element={

              <Audit />

            }
          />

          <Route
            path="/roles"
            element={

              <Roles />

            }
          />

          <Route
            path="/casas"
            element={
              
                <Houses />
              
            }
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
