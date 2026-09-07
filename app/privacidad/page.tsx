import type { Metadata } from 'next';
import { metadataFor } from '../../data/seo.mjs';

export const metadata = metadataFor('privacy') as Metadata;

export default function PrivacyPage() {
  return <main className="privacy-page">
    <header className="privacy-nav">
      <a className="video-brand" href="/" aria-label="Doctor Pep, volver al catálogo">
        <img src="/assets/doctor-pep-logo.webp" width="48" height="48" alt="" />
        <span>DOCTOR <strong>PEP</strong></span>
      </a>
      <a className="privacy-back" href="/">← Volver al catálogo</a>
    </header>
    <article className="privacy-content">
      <p className="section-kicker">DOCTOR PEP / INFORMACIÓN</p>
      <h1>Privacidad y<br /><em>uso responsable.</em></h1>
      <p className="privacy-lead">Una guía breve para entender qué hace esta página y cómo usar la información del catálogo.</p>
      <section>
        <h2>Qué información guarda esta página</h2>
        <p>No necesitas crear una cuenta ni completar formularios para consultar el catálogo. La lista de productos se guarda únicamente en el navegador de tu dispositivo para preparar el mensaje de WhatsApp.</p>
        <p>El alojamiento puede generar registros técnicos habituales para mantener la página segura y disponible.</p>
      </section>
      <section>
        <h2>Cuando abres WhatsApp</h2>
        <p>Al usar el botón de WhatsApp, la página prepara un mensaje con los productos y presentaciones que elegiste. El envío y el tratamiento posterior del mensaje dependen de WhatsApp y de la conversación con Doctor Pep.</p>
        <p>Evita compartir datos de salud sensibles en redes sociales o en espacios públicos.</p>
      </section>
      <section>
        <h2>Catálogo y uso responsable</h2>
        <p>Las imágenes sirven como referencia visual. La presentación, disponibilidad, composición, compatibilidad, conservación y condiciones de entrega deben confirmarse directamente con Doctor Pep antes de realizar un pedido.</p>
        <p>El catálogo es informativo y no sustituye una valoración, diagnóstico ni indicación de un profesional de la salud. No cambies tratamientos ni utilices productos basándote únicamente en esta página.</p>
      </section>
      <section>
        <h2>Estadísticas y preferencias</h2>
        <p>Si está habilitado y lo permites, Google Analytics mide visitas y clics hacia WhatsApp o redes sociales. La integración no envía tu lista, tus búsquedas ni el contenido del mensaje. Puedes cambiar tu elección en este dispositivo.</p>
        <p data-analytics-status="" role="status">Las estadísticas permanecen desactivadas hasta que se configure el servicio y las permitas.</p>
        <button type="button" className="analytics-settings" data-analytics-settings="" hidden>Cambiar preferencia de estadísticas</button>
      </section>
      <section>
        <h2>Publicaciones de redes sociales</h2>
        <p>Al visitar la pestaña Videos, tu navegador puede conectarse con TikTok para mostrar sus videos o con Instagram al abrir la cuenta oficial. Estas plataformas aplican sus propias condiciones y pueden utilizar cookies. La tipografía de la web se solicita a Google Fonts.</p>
      </section>
      <section>
        <h2>Contacto</h2>
        <p>Para confirmar una presentación o resolver una duda, escribe directamente al equipo:</p>
        <a className="privacy-whatsapp" href="https://wa.me/593989009150?text=Hola%2C%20quisiera%20consultar%20el%20cat%C3%A1logo%20Doctor%20Pep." target="_blank" rel="noopener noreferrer">Consultar por WhatsApp ↗</a>
      </section>
      <p className="privacy-updated">Última actualización: septiembre de 2026.</p>
    </article>
    <footer className="video-footer"><span>© 2026 Doctor Pep · BioPeptix</span><div><a href="/">Catálogo</a><a href="/videos">Videos</a></div></footer>
  </main>;
}
