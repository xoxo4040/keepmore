// Main entry point
const root = ReactDOM.createRoot(document.getElementById('root'));

// App is globally available via window.App from src/App.jsx
// But wait, App.jsx script runs before this one.

root.render(
    <React.StrictMode>
        <window.App />
    </React.StrictMode>
);
