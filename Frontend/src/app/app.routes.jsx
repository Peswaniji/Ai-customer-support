import { createBrowserRouter, Navigate } from 'react-router-dom'
import Login from '../features/auth/pages/Login'
import Register from '../features/auth/pages/Register'
import Layout from '../features/agent/pages/Layout'
import Dashboard from '../features/agent/pages/Dashboard'
import ChatSection from '../features/agent/pages/ChatSection'
import MyTickets from '../features/agent/pages/MyTickets'

 // Admin imports
import AdminLayout from '../shared/components/layout/AdminLayout'
import DashboardPage from '../features/dashboard/pages/DashboardPage'
import AgentsPage from '../features/agent/pages/AgentsPage'
import TicketsPage from '../features/tickets/pages/TicketsPage'
import TicketDetailPage from '../features/tickets/pages/TicketDetailPage'
import AnalyticsPage from '../features/analytics/pages/AnalyticsPage'
import SettingsPage from '../features/settings/pages/SettingsPage'


const getRedirect = () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return '/login'
    return null
}

export const routes = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/login" replace />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    },

    // Business Admin routes
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="/admin/dashboard" replace />
            },
            {
                path: 'dashboard',
                element: <DashboardPage />
            },
            {
                path: 'agents',
                element: <AgentsPage />
            },
            {
                path: 'tickets',
                element: <TicketsPage />
            },
            {
                path: 'tickets/:ticketId',
                element: <TicketDetailPage />
            },
            {
                path: 'analytics',
                element: <AnalyticsPage />
            },
            {
                path: 'settings',
                element: <SettingsPage />
            },
        ]
    },

    // Agent routes
    {
        path: '/agent',
        element: <Layout />,
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />
            },
            {
                path: 'chats/:ticketId',
                element: <ChatSection />
            },
            {
                path: 'my-tickets',
                element: <MyTickets />
            }
        ]
    },

    // 404
    {
        path: '*',
        element: <Navigate to="/login" replace />
    }
])