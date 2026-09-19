import type { Metadata } from 'next';
import VideoGallery from './video-gallery';
import { videos, validVideo } from '../../data/videos';
import { metadataFor } from '../../data/seo.mjs';

export const metadata = metadataFor('videos') as Metadata;
export const dynamic = 'force-static';

export default function VideosPage() {
  return <VideoGallery videos={videos.filter(validVideo).sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))} />;
}
