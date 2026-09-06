'use client';

import { useEffect, useRef, useState } from 'react';
import { socialAccounts, type DoctorPepVideo, type SocialPlatform } from '../../data/videos';

function SocialIcon({platform}: {platform:SocialPlatform}) {
  return platform === 'instagram' ? <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 4v10.1a4.8 4.8 0 1 1-4.1-4.7v3.2a1.8 1.8 0 1 0 1.1 1.6V4h3Z"/><path d="M14.5 4c.6 2.5 2.2 3.9 5 4.1v3c-2-.1-3.7-.8-5-2"/></svg>;
}

const creatorEmbed = `<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:white}blockquote{margin:0!important}</style></head><body><blockquote class="tiktok-embed" cite="https://www.tiktok.com/@doctor.pep.26" data-unique-id="doctor.pep.26" data-embed-type="creator" style="max-width:780px;min-width:288px"><section><a target="_blank" rel="noopener" href="https://www.tiktok.com/@doctor.pep.26">@doctor.pep.26</a></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script></body></html>`;

export default function VideoGallery({videos}: {videos:DoctorPepVideo[]}) {
  const [filter, setFilter] = useState<'all' | SocialPlatform>('all');
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState<DoctorPepVideo | 'tiktok-profile' | null>(null);
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
  const open = (entry: DoctorPepVideo | 'tiktok-profile', button: HTMLButtonElement) => {
    trigger.current = button; setActive(entry);
  };
  const close = () => { setActive(null); trigger.current?.focus({preventScroll:true}); };
  const filtered = videos.filter(v => (filter === 'all' || v.platform === filter) && (!featured || v.featured));
  const platform = active === 'tiktok-profile' ? 'tiktok' : active?.platform;
  const originUrl = active === 'tiktok-profile' ? socialAccounts.tiktok : active?.url;
  const playerUrl = typeof active === 'object' && active ? active.platform === 'tiktok'
    ? `https://www.tiktok.com/player/v1/${new URL(active.url).pathname.split('/').pop()}?autoplay=0&loop=0`
    : `${active.url.replace(/\/$/, '')}/embed/` : undefined;
  return <>
    <header className="video-nav"><a className="video-brand" href="/" aria-label="Doctor Pep, volver al inicio"><img src="/assets/doctor-pep-logo.webp" width="48" height="48" alt=""/><span>DOCTOR <strong>PEP</strong></span></a><nav aria-label="Navegación principal"><a href="/#catalogo-completo">Catálogo</a><a href="/videos" aria-current="page">Videos</a><a href="/?lista=1">Mi lista</a></nav></header>
    <main className="videos-page">
      <section className="videos-intro">
        <div><p className="section-kicker">DOCTOR PEP / EN VIDEO</p><h1>Más cerca.<br/><em>En cada video.</em></h1><p>Un espacio para las publicaciones de Doctor Pep en TikTok e Instagram.</p><a className="video-back" href="/#catalogo-completo">← Volver al catálogo</a></div>
        <div className="video-brand-panel"><img src="/assets/doctor-pep-logo.webp" width="280" height="280" alt="Logo de Doctor Pep"/><span>@doctor.pep.26</span><div><SocialIcon platform="tiktok"/><span aria-hidden="true">+</span><SocialIcon platform="instagram"/></div></div>
      </section>
      <section className="video-library" aria-labelledby="video-library-title">
        <div className="video-library-head"><div><p className="section-kicker">EN NUESTRAS REDES</p><h2 id="video-library-title">Explora las publicaciones</h2></div><div className="video-filters" role="group" aria-label="Filtrar videos por plataforma">{(['all','tiktok','instagram'] as const).map(key => <button key={key} aria-pressed={filter === key} onClick={() => {setFilter(key);setFeatured(false);}}>{key === 'all' ? 'Todos' : key === 'tiktok' ? 'TikTok' : 'Instagram'}</button>)}</div></div>
        <div className="social-channel-grid">
          {(filter === 'all' || filter === 'tiktok') && <article className="social-channel tiktok-channel"><span className="channel-icon"><SocialIcon platform="tiktok"/></span><div><span className="channel-label">TikTok</span><h3>@doctor.pep.26</h3><p>Explora los videos recientes que TikTok permite mostrar desde el perfil oficial.</p></div><button onClick={e => open('tiktok-profile', e.currentTarget)}><span aria-hidden="true">▷</span> Mostrar publicaciones</button><a href={socialAccounts.tiktok} target="_blank" rel="noopener noreferrer">Abrir TikTok ↗</a></article>}
          {(filter === 'all' || filter === 'instagram') && <article className="social-channel instagram-channel"><span className="channel-icon"><SocialIcon platform="instagram"/></span><div><span className="channel-label">Instagram</span><h3>@doctor.pep.26</h3><p>Encuentra los reels y publicaciones de Doctor Pep en su cuenta de Instagram.</p></div><a className="channel-primary" href={socialAccounts.instagram} target="_blank" rel="noopener noreferrer">Ver publicaciones ↗</a><span className="channel-note">La galería integrada requiere enlaces verificados.</span></article>}
        </div>
        {videos.length > 0 && <><div className="video-order"><p>Publicaciones verificadas · de más recientes a anteriores</p>{videos.some(v => v.featured) && <button aria-pressed={featured} onClick={() => setFeatured(!featured)}>Selección de Doctor Pep</button>}</div><div className="video-grid">{filtered.map(video => <article className="video-card" key={video.id}><button className="video-cover" onClick={e => open(video,e.currentTarget)} aria-label={'Reproducir ' + video.title}>{video.thumbnail ? <img src={video.thumbnail} alt="" loading="lazy" width="360" height="640"/> : <div className="video-cover-brand"><img src="/assets/doctor-pep-logo.webp" alt="" width="140" height="140"/><span>Doctor Pep</span></div>}<span className="video-platform"><SocialIcon platform={video.platform}/>{video.platform === 'tiktok' ? 'TikTok' : 'Instagram'}</span><span className="video-play" aria-hidden="true">▷</span></button><div className="video-card-copy">{video.featured && <span className="video-featured">Selección de Doctor Pep</span>}<h3>{video.title}</h3><time dateTime={video.publishedAt}>{new Date(video.publishedAt).toLocaleDateString('es-EC',{day:'numeric',month:'long',year:'numeric',timeZone:'America/Guayaquil'})}</time><a href={video.url} target="_blank" rel="noopener noreferrer">Ver publicación original ↗</a></div></article>)}</div>{!filtered.length && <p role="status" className="video-empty">No hay publicaciones verificadas para este filtro. Puedes consultar el perfil oficial.</p>}</>}
        <p className="video-privacy">Los reproductores se cargan solo al abrirlos y se conectan con la plataforma de origen. Algunas publicaciones pueden requerir iniciar sesión o no permitir reproducción fuera de la app.</p>
      </section>
      <section className="video-catalog-return"><h2>¿Buscas un producto?</h2><p>Vuelve al catálogo para revisar sus presentaciones y preparar tu consulta.</p><a href="/#catalogo-completo">Explorar catálogo →</a></section>
    </main>
    <footer className="video-footer"><span>© 2026 Doctor Pep</span><div>{(['tiktok','instagram'] as const).map(key => <a key={key} href={socialAccounts[key]} target="_blank" rel="noopener noreferrer" aria-label={'Doctor Pep en ' + key}><SocialIcon platform={key}/><span>@doctor.pep.26</span></a>)}</div></footer>
    <a className="whatsapp-float" href={wa} aria-label="Consultar por WhatsApp" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.7" d="M20 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.1-4.4A8.5 8.5 0 1 1 20 11.5Z"/><path fill="none" stroke="currentColor" strokeWidth="1.7" d="M8 7c-2 3 2 7 5 8l2-2-2-1-1 1-3-3 1-1-2-2Z"/></svg><span className="whatsapp-label">WhatsApp</span></a>
    <dialog className="video-player-dialog" ref={modal} onClose={close} aria-label="Publicación de Doctor Pep" onClick={e => {if(e.target === e.currentTarget) e.currentTarget.close();}}><div className="video-player-head"><strong>{platform === 'tiktok' ? 'TikTok' : 'Instagram'} · Doctor Pep</strong><button onClick={() => modal.current?.close()} aria-label="Cerrar reproductor">×</button></div>{active && <><p className="player-load-status" role="status">{delayed ? 'Si no aparece la publicación, puedes abrirla en su plataforma.' : loaded ? 'Usa los controles de la plataforma para reproducir.' : 'Conectando con la plataforma…'}</p><iframe key={typeof active === 'string' ? active : active.id} title={active === 'tiktok-profile' ? 'Publicaciones recientes de Doctor Pep en TikTok' : active.title} src={playerUrl} srcDoc={active === 'tiktok-profile' ? creatorEmbed : undefined} loading="lazy" allow="fullscreen; encrypted-media" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin-when-cross-origin" onLoad={() => setLoaded(true)} onError={() => setDelayed(true)}/><a className="player-source" href={originUrl} target="_blank" rel="noopener noreferrer">Abrir en {platform === 'tiktok' ? 'TikTok' : 'Instagram'} ↗</a></>}</dialog>
  </>;
}
