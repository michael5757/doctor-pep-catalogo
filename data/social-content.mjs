import publications from './publications.json' with { type: 'json' };

export const socialAccounts = {
  tiktok: 'https://www.tiktok.com/@doctor.pep.26',
  instagram: 'https://www.instagram.com/doctor.pep.26/',
};

export function validVideo(video) {
  try {
    const url = new URL(video.url);
    const date = new Date(video.publishedAt);
    return video.ownerVerified === true && typeof video.id === 'string' && video.id.trim().length > 0 &&
      typeof video.title === 'string' && video.title.trim().length > 0 &&
      /^\d{4}-\d{2}-\d{2}$/.test(video.publishedAt) && date.toISOString().slice(0, 10) === video.publishedAt &&
      date.getTime() <= Date.now() && !url.search && !url.hash &&
      (!video.thumbnail || /^\/assets\/[a-zA-Z0-9_./-]+$/.test(video.thumbnail) && !video.thumbnail.includes('..')) &&
      (video.platform === 'tiktok'
        ? url.origin === 'https://www.tiktok.com' && /^\/@doctor\.pep\.26\/video\/\d+\/?$/.test(url.pathname)
        : video.platform === 'instagram' && url.origin === 'https://www.instagram.com' && /^\/(reel|p)\/[A-Za-z0-9_-]+\/?$/.test(url.pathname));
  } catch { return false; }
}

export function selectVideos(items = publications, platform = 'all', order = 'recent') {
  const seen = new Set();
  return items.filter(video => {
    if (!validVideo(video) || seen.has(video.id) || (platform !== 'all' && video.platform !== platform)) return false;
    seen.add(video.id);
    return order !== 'featured' || video.featured === true;
  }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id));
}

export function catalogLink(id, presentation, local = false) {
  const params = new URLSearchParams({ producto: id, presentacion: presentation });
  return (local ? 'index.html#?' : '/?') + params.toString();
}
