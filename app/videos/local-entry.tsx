import { createRoot } from 'react-dom/client';
import VideoGallery from './video-gallery';
import { videos, validVideo } from '../../data/videos';

const root = document.getElementById('videosRoot');
if (root) createRoot(root).render(
  <VideoGallery local videos={videos.filter(validVideo).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))} />
);
