// src/App.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DeviceProvider } from './contexts/DeviceContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);

function App() {
  return (
    <DeviceProvider>
      <RouterProvider router={router} />
    </DeviceProvider>
  );
}

export default App;