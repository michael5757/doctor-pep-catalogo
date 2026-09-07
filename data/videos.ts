export type SocialPlatform = 'tiktok' | 'instagram';
export type DoctorPepVideo = {
  id: string;
  platform: SocialPlatform;
  url: string;
  title: string;
  publishedAt: string;
  thumbnail?: string;
  featured?: boolean;
  ownerVerified: true;
  relatedProductIds?: string[];
};

import publications from './publications.json';
export { socialAccounts, validVideo, selectVideos, catalogLink } from './social-content.mjs';

// Only verified Doctor Pep publications. No fabricated posts, metrics or dates.
// Add owner-approved permanent video/reel URLs here; newest first is automatic.
export const videos = publications as DoctorPepVideo[];
