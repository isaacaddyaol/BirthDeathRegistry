export const config = {
  auth: {
    projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
    publishableKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
    secretKey: process.env.STACK_SECRET_SERVER_KEY,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  session: {
    secret: 'your-secret-key', // TODO: Move to environment variable
    cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  },
}; 