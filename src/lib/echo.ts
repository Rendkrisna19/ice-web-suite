import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export const getEcho = (token?: string) => {
  if (typeof window === 'undefined') return null;

  const authEndpoint = process.env.NEXT_PUBLIC_API_URL 
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1$/, '') + '/broadcasting/auth'
    : 'http://localhost:8000/broadcasting/auth';

  const pusherInstance = new Pusher(
    process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'local',
    {
      cluster: 'mt1',
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
      wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
      forceTLS: false,
      enabledTransports: ['ws'],
      disableStats: true,
      authEndpoint: authEndpoint,
      auth: {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json'
        }
      }
    }
  );

  return new Echo({
    broadcaster: 'reverb',
    client: pusherInstance,
  });
};