export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log('[Instrumentation] Initializing Alert Worker...');
        const { alertWorker } = await import('./services/alertWorker');
        console.log('[Instrumentation] Alert Worker initialized successfully.');
    }
}
