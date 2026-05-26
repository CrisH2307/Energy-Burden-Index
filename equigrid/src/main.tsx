import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// ArcGIS theme must be imported before our index.css to allow Tailwind to override
import '@arcgis/core/assets/esri/themes/light/main.css'
import './index.css'

// StrictMode intentionally disabled: ArcGIS MapView must not mount twice
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
