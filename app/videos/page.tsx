import type { Metadata } from 'next';
import VideoGallery from './video-gallery';
import { videos, validVideo } from '../../data/videos';

export const metadata: Metadata = {
  title: 'Videos de Doctor Pep | TikTok e Instagram',
  description: 'Explora las publicaciones de Doctor Pep en una página independiente del catálogo.',
  alternates: { canonical: '/videos' },
  openGraph: { title: 'Doctor Pep en video', description: 'Publicaciones de Doctor Pep en TikTok e Instagram.', url: '/videos' },
};

export default function VideosPage() {
  return <VideoGallery videos={videos.filter(validVideo).sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))} />;
}
