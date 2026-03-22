export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = (error: unknown) => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Sentry will automatically capture this if using the latest SDK
  }
};
