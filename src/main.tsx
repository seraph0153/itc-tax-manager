import ErrorBoundary from './components/common/ErrorBoundary';

console.log('Main.tsx is running');

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>,
)
