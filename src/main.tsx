import 'core-js/stable'
import 'regenerator-runtime/runtime'
import 'whatwg-fetch'  // Polyfill fetch() for Safari 10
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'

const savedTheme = localStorage.getItem('theme') || 'light'
const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const themeClass = savedTheme === 'system' ? (isSystemDark ? 'dark' : 'light') : savedTheme
document.documentElement.classList.add(themeClass)

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
)
