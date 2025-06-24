import { type MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CulinAI: Your Kitchen Rebel',
    short_name: 'CulinAI',
    description: 'Your AI-powered sous-chef. No tiny rat hiding in your hat required.',
    start_url: '/',
    display: 'standalone',
    background_color: '#030617',
    theme_color: '#FF8C00',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
       {
        src: '/apple-icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
