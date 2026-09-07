'use client';

import { useEffect, useRef, useState } from 'react';
import { socialAccounts, selectVideos, catalogLink, type DoctorPepVideo, type SocialPlatform } from '../../data/videos';
import socialProducts from '../../data/social-products.generated.json';

function SocialIcon({platform}: {platform:SocialPlatform}) {
  return platform === 'instagram' ? <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 4v10.1a4.8 4.8 0 1 1-4.1-4.7v3.2a1.8 1.8 0 1 0 1.1 1.6V4h3Z"/><path d="M14.5 4c.6 2.5 2.2 3.9 5 4.1v3c-2-.1-3.7-.8-5-2"/></svg>;
}

const creatorEmbed = `<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:white}blockquote{margin:0!important}</style></head><body><blockquote class="tiktok-embed" cite="https://www.tiktok.com/@doctor.pep.26" data-unique-id="doctor.pep.26" data-embed-type="creator" style="max-width:780px;min-width:288px"><section><a target="_blank" rel="noopener" href="https://www.tiktok.com/@doctor.pep.26">@doctor.pep.26</a></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script></body></html>`;

export default function VideoGallery({videos, local = false}: {videos:DoctorPepVideo[]; local?:boolean}) {
  const home = local ? 'index.html' : '/';
  const logo = local ? 'assets/doctor-pep-logo.webp' : '/assets/doctor-pep-logo.webp';
  const gallery = local ? 'videos.html' : '/videos';
  const [filter, setFilter] = useState<'all' | SocialPlatform>('all');
  const [order, setOrder] = useState<'recent' | 'featured'>('recent');
  const [active, setActive] = useState<DoctorPepVideo | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [delayed, setDelayed] = useState(false);
  const [wa, setWa] = useState('https://wa.me/593989009150?text=' + encodeURIComponent('Hola, quisiera consultar el catálogo Doctor Pep.'));
  const modal = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    try {
      const saved: {name:string;presentation:string;quantity:number}[] = JSON.parse(localStorage.getItem('doctorPepConsultationV1') || '[]');
      if (Array.isArray(saved) && saved.length) setWa('https://wa.me/593989009150?text=' + encodeURIComponent('Hola, quisiera consultar disponibilidad de estos productos Doctor Pep:\n\n' + saved.filter(x => x && x.name && x.presentation).map(x => `• ${Math.max(1, Math.min(99, Math.floor(Number(x.quantity)) || 1))} × ${x.name} — ${x.presentation}`).join('\n') + '\n\n¿Podrían confirmarme disponibilidad, entrega y forma de pago?'));
    } catch {}
  }, []);
  useEffect(() => {
    if (!active) return;
    setLoaded(false); setDelayed(false);
    modal.current?.showModal();
    const timer = setTimeout(() => setDelayed(true), 10000);
    // Unmounting the only player stops playback when the visitor leaves the tab.
    const stop = () => { if (document.hidden) modal.current?.close(); };
    document.addEventListener('visibilitychange', stop);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', stop); };
  }, [active]);
  const open = (entry: DoctorPepVideo, button: HTMLButtonElement) => {
    trigger.current = button; setActive(entry);
  };
  const close = () => { setActive(null); trigger.current?.focus({preventScroll:true}); };
  const filtered: DoctorPepVideo[] = selectVideos(videos, filter, order);
  const products = socialProducts as Record<string, {id:string;name:string;presentation:string;image:string}>;
  const platform = active?.platform;
  const originUrl = active?.url;
  const playerUrl = active ? active.platform === 'tiktok'
    ? `https://www.tiktok.com/player/v1/${new URL(active.url).pathname.replace(/\/$/, '').split('/').pop()}?autoplay=0&loop=0`
    : `${active.url.replace(/\/$/, '')}/embed/` : undefined;
  return <div className="videos-shell">
    <header className="video-nav"><a className="video-brand" href={home} aria-label="Doctor Pep, volver al inicio"><img src={logo} width="48" height="48" alt=""/><span>DOCTOR <strong>PEP</strong></span></a><nav aria-label="Navegación principal"><a href={home + '#catalogo-completo'}>Catálogo</a><a href={gallery} aria-current="page">Videos</a><a href={home + (local ? '#?lista=1' : '?lista=1')}>Mi lista</a></nav></header>
    <main className="videos-page">
      <section className="social-directory" aria-labelledby="social-title">
        <div className="videos-intro"><h1 id="social-title">En nuestras redes</h1><p>@doctor.pep.26</p></div>
        <div className="social-channel-grid">
          <article className="social-channel tiktok-channel tiktok-feed"><span className="channel-icon"><SocialIcon platform="tiktok"/></span><h2 id="tiktok-feed-title">TikTok</h2><iframe className="tiktok-profile-frame" title="Videos recientes de Doctor Pep en TikTok" srcDoc={creatorEmbed} loading="eager" allow="autoplay; fullscreen; encrypted-media" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin-when-cross-origin"/><p className="social-feed-note">Los videos empiezan sin sonido. Usa el control de audio del reproductor cuando quieras escucharlos.</p><a className="channel-primary" href={socialAccounts.tiktok} target="_blank" rel="noopener noreferrer">Abrir TikTok ↗</a></article>
          <article className="social-channel instagram-channel"><span className="channel-icon"><SocialIcon platform="instagram"/></span><h2>Instagram</h2><a className="channel-primary" href={socialAccounts.instagram} target="_blank" rel="noopener noreferrer" aria-label="Abrir el perfil de Doctor Pep en Instagram, nueva pestaña">Abrir perfil <span aria-hidden="true">↗</span></a></article>
        </div>
        <p className="video-privacy">Los videos se cargan desde la cuenta oficial de TikTok. Usa sus controles para pausar o escuchar.</p>
      </section>
      {videos.length > 0 && <section id="publicaciones" className="video-library" aria-labelledby="video-library-title">
        <div className="video-library-head"><h2 id="video-library-title">Videos</h2><div className="video-filters" role="group" aria-label="Filtrar videos por plataforma">{(['all','tiktok','instagram'] as const).map(key => <button key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>{key === 'all' ? 'Todos' : key === 'tiktok' ? 'TikTok' : 'Instagram'}</button>)}</div></div>
          <div className="video-order"><p role="status">{filtered.length} {filtered.length === 1 ? 'publicación' : 'publicaciones'}</p><label>Mostrar <select value={order} onChange={e => setOrder(e.target.value as 'recent' | 'featured')}><option value="recent">Más recientes</option><option value="featured">Selección de Doctor Pep</option></select></label></div>
          <div className="video-grid">{filtered.map(video => <article className="video-card" key={video.id}>
            <button className="video-cover" data-video-open="publication" onClick={e => open(video,e.currentTarget)} aria-label={'Reproducir ' + video.title}>
              {video.thumbnail ? <img src={local ? video.thumbnail.replace(/^\/(?!\/)/, '') : video.thumbnail} alt="" loading="lazy" decoding="async" width="360" height="640"/> : <div className="video-cover-brand"><img src={logo} alt="" width="140" height="140" loading="lazy"/><span>Doctor Pep</span></div>}
              <span className="video-platform"><SocialIcon platform={video.platform}/>{video.platform === 'tiktok' ? 'TikTok' : 'Instagram'}</span><span className="video-play" aria-hidden="true">▷</span>
            </button>
            <div className="video-card-copy">
              {video.featured && <span className="video-featured">Selección de Doctor Pep</span>}<h3>{video.title}</h3>
              <time dateTime={video.publishedAt}>{new Date(video.publishedAt + 'T12:00:00Z').toLocaleDateString('es-EC',{day:'numeric',month:'long',year:'numeric',timeZone:'America/Guayaquil'})}</time>
              <a href={video.url} target="_blank" rel="noopener noreferrer">Ver publicación original ↗</a>
              {(video.relatedProductIds || []).filter(id => products[id]).map(id => { const product = products[id]; return <a className="video-related-product" key={id} href={catalogLink(id, product.presentation, local)}><img src={local ? product.image.replace(/^\//, '') : '/' + product.image.replace(/^\//, '')} alt="" width="54" height="54" loading="lazy" decoding="async"/><span><small>En esta publicación</small><strong>{product.name}</strong><span>Ver ficha ↗</span></span></a>; })}
            </div>
          </article>)}</div>
          {!filtered.length && <p role="status" className="video-empty">Todavía no hay publicaciones en esta selección. Prueba con otra plataforma o elige «Más recientes».</p>}
      </section>}
    </main>
    <footer className="video-footer"><span>© 2026 Doctor Pep</span><a href={local ? 'privacidad.html' : '/privacidad'}>Privacidad y uso responsable</a></footer>
    <a className="whatsapp-float" href={wa} aria-label="Consultar por WhatsApp" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.7" d="M20 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.1-4.4A8.5 8.5 0 1 1 20 11.5Z"/><path fill="none" stroke="currentColor" strokeWidth="1.7" d="M8 7c-2 3 2 7 5 8l2-2-2-1-1 1-3-3 1-1-2-2Z"/></svg><span className="whatsapp-label">WhatsApp</span></a>
    <dialog className="video-player-dialog" ref={modal} onClose={close} aria-label="Publicación de Doctor Pep" onClick={e => {if(e.target === e.currentTarget) e.currentTarget.close();}}><div className="video-player-head"><strong>{platform === 'tiktok' ? 'TikTok' : 'Instagram'} · Doctor Pep</strong><button onClick={() => modal.current?.close()} aria-label="Cerrar reproductor">×</button></div>{active && <><p className="player-load-status" role="status">{delayed ? 'Si no aparece la publicación, puedes abrirla en su plataforma.' : loaded ? 'Usa los controles de la plataforma para reproducir.' : 'Conectando con la plataforma…'}</p><iframe key={active.id} title={active.title} src={playerUrl} loading="lazy" allow="autoplay; fullscreen; encrypted-media" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin-when-cross-origin" onLoad={() => setLoaded(true)} onError={() => setDelayed(true)}/><a className="player-source" href={originUrl} target="_blank" rel="noopener noreferrer">Abrir en {platform === 'tiktok' ? 'TikTok' : 'Instagram'} ↗</a></>}</dialog>
  </div>;
}
