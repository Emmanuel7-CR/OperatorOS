import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
<<<<<<< HEAD
import { AuthProvider }      from './context/AuthContext'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import { OSShell }           from './components/layout/OSShell'
import { RealtimeProvider }  from './context/RealtimeProvider'
import { OfflineBanner }     from './components/ui/OfflineBanner'
import { PWABanner }         from './components/ui/PWABanner'

// Public
import LandingPage   from './pages/LandingPage'
import LoginPage     from './pages/auth/LoginPage'
import SignupPage    from './pages/auth/SignupPage'
import NotFoundPage  from './pages/NotFoundPage'

// OS
import OSDashboard   from './pages/modules/OSDashboard'
import SettingsPage  from './pages/modules/SettingsPage'

// Finance
import FinanceShell     from './pages/modules/FinanceShell'
import FinanceOverview  from './pages/modules/FinanceOverview'
import TransactionsPage from './pages/modules/finance/TransactionsPage'
import BudgetsPage      from './pages/modules/finance/BudgetsPage'
import ReportsPage      from './pages/modules/finance/ReportsPage'
import GoalsPage        from './pages/modules/finance/GoalsPage'

// Execute
import ExecuteShell  from './pages/modules/ExecuteShell'
import ExecuteToday  from './pages/modules/execute/ExecuteToday'
import TasksPage     from './pages/modules/execute/TasksPage'
import HabitsPage    from './pages/modules/execute/HabitsPage'

// Growth
import GrowthShell   from './pages/modules/GrowthShell'
import OutreachPage  from './pages/modules/growth/OutreachPage'

// Vision
import VisionShell   from './pages/modules/VisionShell'
import DreamBoardPage from './pages/modules/vision/DreamBoardPage'

=======
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import { OSShell } from './components/layout/OSShell'

// Public
import LandingPage  from './pages/LandingPage'
import LoginPage    from './pages/auth/LoginPage'
import SignupPage   from './pages/auth/SignupPage'
import NotFoundPage from './pages/NotFoundPage'

// OS
import OSDashboard  from './pages/modules/OSDashboard'
import SettingsPage from './pages/modules/SettingsPage'

// Finance
import FinanceShell    from './pages/modules/FinanceShell'
import FinanceOverview from './pages/modules/FinanceOverview'
import TransactionsPage from './pages/modules/finance/TransactionsPage'
import BudgetsPage     from './pages/modules/finance/BudgetsPage'
import ReportsPage     from './pages/modules/finance/ReportsPage'
import GoalsPage       from './pages/modules/finance/GoalsPage'

// Module shells
import ExecuteShell from './pages/modules/ExecuteShell'
import GrowthShell  from './pages/modules/GrowthShell'
import VisionShell  from './pages/modules/VisionShell'
import ComingSoon   from './pages/ComingSoon'

import { RealtimeProvider } from './context/RealtimeProvider'
import { OfflineBanner } from './components/ui/OfflineBanner'
>>>>>>> 37412e791e3d8fdcf1ec9a47652343000fde0ba9
import './styles/globals.css'

const TOAST_STYLE = {
  background: 'var(--bg-elevated)',
<<<<<<< HEAD
  color:      'var(--text-primary)',
  border:     '1px solid var(--border)',
  borderRadius: '10px',
  fontFamily: 'var(--font-body)',
  fontSize:   '0.86rem',
  boxShadow:  'var(--shadow-lg)',
=======
  color: 'var(--text-primary)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  fontFamily: 'var(--font-body)',
  fontSize: '0.86rem',
  boxShadow: 'var(--shadow-lg)',
>>>>>>> 37412e791e3d8fdcf1ec9a47652343000fde0ba9
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: TOAST_STYLE,
            success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-elevated)' } },
            error:   { iconTheme: { primary: 'var(--danger)',  secondary: 'var(--bg-elevated)' } },
          }}
        />

        <Routes>
          {/* Public */}
          <Route path="/"       element={<LandingPage />} />
          <Route path="/login"  element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

<<<<<<< HEAD
          {/* Protected OS */}
=======
          {/* Protected OS Shell */}
>>>>>>> 37412e791e3d8fdcf1ec9a47652343000fde0ba9
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <RealtimeProvider>
                  <OfflineBanner />
<<<<<<< HEAD
                  <PWABanner />
                  <OSShell>
                    <Routes>
                      <Route index element={<OSDashboard />} />

                      {/* Finance */}
                      <Route path="finance" element={<FinanceShell />}>
                        <Route index          element={<FinanceOverview />} />
                        <Route path="txns"    element={<TransactionsPage />} />
                        <Route path="budgets" element={<BudgetsPage />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="goals"   element={<GoalsPage />} />
                      </Route>

                      {/* Execute */}
                      <Route path="execute" element={<ExecuteShell />}>
                        <Route index          element={<ExecuteToday />} />
                        <Route path="tasks"   element={<TasksPage />} />
                        <Route path="habits"  element={<HabitsPage />} />
                      </Route>

                      {/* Growth */}
                      <Route path="growth" element={<GrowthShell />}>
                        <Route index           element={<Navigate to="outreach" replace />} />
                        <Route path="outreach" element={<OutreachPage />} />
                      </Route>

                      {/* Vision */}
                      <Route path="vision" element={<VisionShell />}>
                        <Route index       element={<Navigate to="board" replace />} />
                        <Route path="board" element={<DreamBoardPage />} />
                      </Route>

                      {/* Settings */}
                      <Route path="settings" element={<SettingsPage />} />

                      <Route path="*" element={<Navigate to="/app" replace />} />
                    </Routes>
                  </OSShell>
=======
                  <OSShell>
                  <Routes>
                    <Route index element={<OSDashboard />} />

                    {/* Finance Module */}
                    <Route path="finance" element={<FinanceShell />}>
                      <Route index          element={<FinanceOverview />} />
                      <Route path="txns"    element={<TransactionsPage />} />
                      <Route path="budgets" element={<BudgetsPage />} />
                      <Route path="reports" element={<ReportsPage />} />
                      <Route path="goals"   element={<GoalsPage />} />
                    </Route>

                    {/* Execute Module */}
                    <Route path="execute"        element={<ExecuteShell />} />
                    <Route path="execute/tasks"  element={<ComingSoon label="Tasks — coming in Phase 6" />} />
                    <Route path="execute/habits" element={<ComingSoon label="Habits — coming in Phase 6" />} />

                    {/* Growth Module */}
                    <Route path="growth"          element={<GrowthShell />} />
                    <Route path="growth/outreach" element={<ComingSoon label="Outreach CRM — coming in Phase 6" />} />

                    {/* Vision Module */}
                    <Route path="vision"       element={<VisionShell />} />
                    <Route path="vision/board" element={<ComingSoon label="Dream Board — coming in Phase 7" />} />

                    {/* Settings */}
                    <Route path="settings" element={<SettingsPage />} />

                    <Route path="*" element={<Navigate to="/app" replace />} />
                  </Routes>
                </OSShell>
>>>>>>> 37412e791e3d8fdcf1ec9a47652343000fde0ba9
                </RealtimeProvider>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
