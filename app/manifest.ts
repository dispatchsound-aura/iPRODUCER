import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TYPE BEAT STUDIO',
    short_name: 'TYPE BEAT STUDIO',
    description: 'AI Instrumental Generation Suite',
    start_url: '/',
    display: 'standalone',
    background_color: '#05050A',
    theme_color: '#05050A',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
