import React, { useEffect, useState } from 'react';
export default function BannerSlider({ banners }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = setInterval(() => setIndex(value => (value + 1) % banners.length), 6000);
    return () => clearInterval(timer);
  }, [paused, reducedMotion, banners.length]);
  const move = delta => setIndex(value => (value + delta + banners.length) % banners.length);
  return <main className="hero-slider-section smooth-slider" aria-label="Предложения магазина"
    onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
    onFocusCapture={() => setPaused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false); }}>
    <div className="slide-viewport">
      {banners.map((src, number) => <img key={src} src={src} alt={`Предложение ${number + 1}`}
        aria-hidden={number !== index} className={`banner-img ${number === index ? 'is-active' : ''}`} />)}
    </div>
    <button className="slider-arrow arrow-left" aria-label="Предыдущий баннер" onClick={() => move(-1)}>❮</button>
    <button className="slider-arrow arrow-right" aria-label="Следующий баннер" onClick={() => move(1)}>❯</button>
  </main>;
}
