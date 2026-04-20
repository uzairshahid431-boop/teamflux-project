import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './Context/AuthContext.tsx'
import { UIProvider } from './Context/UIContext.tsx'
import App from './App.tsx'
import { Toaster } from 'react-hot-toast'
import './App.css'

import { Provider } from 'react-redux'
import { store } from './store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <UIProvider>
            <App />
            <Toaster position="top-right" />
          </UIProvider>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
