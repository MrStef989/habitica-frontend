import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AuthPage }         from './pages/AuthPage'
import { TasksPage }        from './pages/TasksPage'
import { ShopPage }         from './pages/ShopPage'
import { ProfilePage }      from './pages/ProfilePage'
import { AchievementsPage } from './pages/AchievementsPage'
import { Layout }           from './components/Layout'
import { ProtectedRoute }   from './components/ProtectedRoute'
import { ToastContainer }   from './components/Toast'

import './styles/global.css'

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<AuthPage />} />

          {/* Protected — all inside Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/tasks" replace />} />
            <Route path="/tasks"        element={<TasksPage />} />
            <Route path="/shop"         element={<ShopPage />} />
            <Route path="/profile"      element={<ProfilePage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/tasks" replace />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer />
    </QueryClientProvider>
  </StrictMode>,
)
