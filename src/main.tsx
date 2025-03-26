
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create a safer mounting point that checks if the element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Failed to find the root element. The app cannot be mounted.");
} else {
  try {
    console.log("Attempting to mount the application...");
    createRoot(rootElement).render(<App />);
    console.log("Application successfully mounted");
  } catch (error) {
    console.error("Failed to render the application:", error);
  }
}
