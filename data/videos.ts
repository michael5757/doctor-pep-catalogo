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
};

export const socialAccounts = {
  tiktok: 'https://www.tiktok.com/@doctor.pep.26',
  instagram: 'https://www.instagram.com/doctor.pep.26/',
};

// Only verified Doctor Pep publications. No fabricated posts, metrics or dates.
// Add owner-approved permanent video/reel URLs here; newest first is automatic.
export const videos: DoctorPepVideo[] = [];

export function validVideo(video: DoctorPepVideo) {
  try {
    const url = new URL(video.url);
    return video.ownerVerified === true && !Number.isNaN(Date.parse(video.publishedAt)) &&
      (video.platform === 'tiktok'
        ? url.origin === 'https://www.tiktok.com' && /^\/@doctor\.pep\.26\/video\/\d+$/.test(url.pathname)
        : url.origin === 'https://www.instagram.com' && /^\/(reel|p)\/[A-Za-z0-9_-]+\/?$/.test(url.pathname));
  } catch { return false; }
}
