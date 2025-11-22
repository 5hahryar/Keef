import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Dashboard from './pages/Dashboard'
import Stats from './pages/Stats'
import LoginPage from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import { Toaster } from 'react-hot-toast'
import InstallmentsPage from './pages/Installments'
import InstallmentDetails from './pages/InstallmentDetails.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <LoginPage /> },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Dashboard /> },
          { path: '/stats', element: <Stats /> },
          { path: '/installments', element: <InstallmentsPage /> },
          { path: '/installments/:id', element: <InstallmentDetails /> },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-center" reverseOrder={false} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
