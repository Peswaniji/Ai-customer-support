import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.jsx'

const Login = lazy(() => import('../features/auth/pages/Login'))
const Register = lazy(() => import('../features/auth/pages/Register'))
const SetPassword = lazy(() => import('../features/auth/pages/SetPassword.jsx'))
const Layout = lazy(() => import('../features/agent/pages/Layout'))
const Dashboard = lazy(() => import('../features/agent/pages/Dashboard'))
const ActiveChatsPage = lazy(() => import('../features/agent/pages/ActiveChatsPage.jsx'))
const ChatSection = lazy(() => import('../features/agent/pages/ChatSection'))
const MyTickets = lazy(() => import('../features/agent/pages/MyTickets'))
const ProfilePage = lazy(() => import('../features/agent/pages/ProfilePage.jsx'))
const AgentPlaceholderPage = lazy(() => import('../features/agent/pages/AgentPlaceholderPage.jsx'))
const AdminLayout = lazy(() => import('../shared/components/layout/AdminLayout'))
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'))
const AgentsPage = lazy(() => import('../features/agent/pages/AgentsPage'))
const TicketsPage = lazy(() => import('../features/tickets/pages/TicketsPage'))
const TicketDetailPage = lazy(() => import('../features/tickets/pages/TicketDetailPage'))
const AnalyticsPage = lazy(() => import('../features/analytics/pages/AnalyticsPage'))
const SettingsPage = lazy(() => import('../features/settings/pages/SettingsPage'))
const PlatformStats = lazy(() => import('../features/superadmin/pages/PlatformStats.jsx'))
const WidgetPage = lazy(() => import('../features/widget/pages/WidgetPage.jsx'))

const withSuspense = (element) => (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
        {element}
    </Suspense>
)

export const routes = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/login" replace />
    },
    {
        path: '/login',
        element: withSuspense(<Login />)
    },
    {
        path: '/register',
        element: withSuspense(<Register />)
    },
    {
        path: '/set-password',
        element: withSuspense(<SetPassword />)
    },
    {
        path: '/widget',
        element: withSuspense(<WidgetPage />)
    },

    // Business Admin routes
    {
        path: '/admin',
        element: withSuspense(
            <ProtectedRoute roles={['business_admin']}>
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="/admin/dashboard" replace />
            },
            {
                path: 'dashboard',
                element: withSuspense(<DashboardPage />)
            },
            {
                path: 'agents',
                element: withSuspense(<AgentsPage />)
            },
            {
                path: 'tickets',
                element: withSuspense(<TicketsPage />)
            },
            {
                path: 'tickets/:ticketId',
                element: withSuspense(<TicketDetailPage />)
            },
            {
                path: 'analytics',
                element: withSuspense(<AnalyticsPage />)
            },
            {
                path: 'settings',
                element: withSuspense(<SettingsPage />)
            },
        ]
    },

    // Agent routes
    {
        path: '/agent',
        element: withSuspense(
            <ProtectedRoute roles={['agent']}>
                <Layout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="/agent/dashboard" replace />
            },
            {
                path: 'dashboard',
                element: withSuspense(<Dashboard />)
            },
            {
                path: 'active-chats',
                element: withSuspense(<ActiveChatsPage />)
            },
            {
                path: 'chats/:ticketId',
                element: withSuspense(<ChatSection />)
            },
            {
                path: 'my-tickets',
                element: withSuspense(<MyTickets />)
            },
            {
                path: 'reports',
                element: withSuspense(
                    <AgentPlaceholderPage
                        title="Reports"
                        description="Coming soon."
                    />
                )
            },
            {
                path: 'profile',
                element: withSuspense(<ProfilePage />)
            }
        ]
    },

    {
        path: '/superadmin/dashboard',
        element: withSuspense(
            <ProtectedRoute roles={['super_admin']}>
                <PlatformStats />
            </ProtectedRoute>
        )
    },

    // 404
    {
        path: '*',
        element: <Navigate to="/login" replace />
    }
])
