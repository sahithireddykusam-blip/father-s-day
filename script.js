/* ==========================================================================
   FATHER'S DAY TRIBUTE — SCRIPT v3
   Sections: intro (text) → banner (image) → memory x12 → final
   ========================================================================== */
(function () {
  'use strict';

  /* ── Element refs ─────────────────────────────────────────────────────── */
  const snapContainer   = document.getElementById('snap-container');
  const progressBar     = document.getElementById('progress-bar');
  const siteHeader      = document.getElementById('site-header');
  const sideNav         = document.getElementById('side-nav');
  const scrollIndicator = document.getElementById('scroll-indicator');
  const heartsContainer = document.getElementById('hearts-container');
  const musicToggle     = document.getElementById('music-toggle');
  const bgMusic         = document.getElementById('bg-music');

  const sections    = Array.from(document.querySelectorAll('.section'));
  const photoFrames = Array.from(document.querySelectorAll('.photo-frame'));
  const closeBtns   = Array.from(document.querySelectorAll('.close-btn'));
  const loveBtns    = Array.from(document.querySelectorAll('.love-btn'));

  /* ── 1. Apply Polaroid tilts ──────────────────────────────────────────── */
  photoFrames.forEach(frame => {
    const tilt = parseFloat(frame.getAttribute('data-tilt') || '0');
    frame.style.transform = `rotate(${tilt}deg)`;
    frame._baseTilt = tilt;
  });

  /* ── 2. Scroll progress + header glass ───────────────────────────────── */
  function updateProgress() {
    const total = snapContainer.scrollHeight - snapContainer.clientHeight;
    const pct   = total > 0 ? (snapContainer.scrollTop / total) * 100 : 0;
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (siteHeader) {
      siteHeader.classList.toggle('scrolled', snapContainer.scrollTop > 10);
    }
  }
  snapContainer.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ── 3. Side-nav dot generator ────────────────────────────────────────── */
  const dots = [];
  if (sideNav) {
    sections.forEach((section, idx) => {
      const label = section.getAttribute('data-title') || `Page ${idx + 1}`;
      const dot   = document.createElement('button');
      dot.className  = 'nav-dot';
      dot.setAttribute('data-label', label);
      dot.setAttribute('aria-label', `Go to: ${label}`);
      if (idx === 0) dot.classList.add('active-dot');
      dot.addEventListener('click', () =>
        section.scrollIntoView({ behavior: 'smooth' })
      );
      sideNav.appendChild(dot);
      dots.push(dot);
    });
  }

  /* ── 4. Intersection observer ─────────────────────────────────────────── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const idx = sections.indexOf(entry.target);

      if (entry.isIntersecting) {
        entry.target.classList.add('active');

        // Sync navigation dots
        dots.forEach((d, i) => d.classList.toggle('active-dot', i === idx));

        // Only show scroll-cue on intro section
        if (scrollIndicator) {
          scrollIndicator.style.opacity =
            (entry.target.id === 'intro') ? '1' : '0';
        }

      } else {
        entry.target.classList.remove('active');
        // Auto-close memory cards when section leaves view
        if (entry.target.classList.contains('memory-section')) {
          entry.target.classList.remove('card-open');
        }
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(s => observer.observe(s));

  /* ── 5. Photo click → open card ──────────────────────────────────────── */
  photoFrames.forEach(frame => {
    frame.addEventListener('click', e => {
      e.stopPropagation();
      const section = frame.closest('.memory-section');
      if (!section) return;
      // Close all others
      sections.forEach(s => { if (s !== section) s.classList.remove('card-open'); });
      section.classList.add('card-open');
    });
  });

  /* ── 6. Close button ──────────────────────────────────────────────────── */
  closeBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const section = btn.closest('.memory-section');
      if (section) section.classList.remove('card-open');
    });
  });

  // Click on section bg to close card
  sections.forEach(section => {
    if (!section.classList.contains('memory-section')) return;
    section.addEventListener('click', e => {
      if (!e.target.closest('.photo-frame') && !e.target.closest('.memory-card')) {
        section.classList.remove('card-open');
      }
    });
  });

  /* ── 7. Love button — increment + heart burst ─────────────────────────── */
  const HEART_CHARS = ['❤', '♥', '❤', '♡'];

  loveBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();

      // Increment
      const countEl = btn.querySelector('.love-count');
      countEl.textContent = parseInt(countEl.textContent, 10) + 1;

      // Pop animation via Web Animations API
      btn.animate(
        [{ transform: 'scale(.85)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }],
        { duration: 340, easing: 'cubic-bezier(0.34,1.56,0.64,1)' }
      );

      // Burst hearts at cursor
      const cx = e.clientX || (btn.getBoundingClientRect().left + btn.offsetWidth / 2);
      const cy = e.clientY || (btn.getBoundingClientRect().top  + btn.offsetHeight / 2);
      for (let i = 0; i < 9; i++) spawnBurstHeart(cx, cy);
    });
  });

  function spawnBurstHeart(x, y) {
    const el     = document.createElement('span');
    el.className = 'burst-heart';
    el.textContent = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];

    const angle = Math.random() * Math.PI * 2;
    const dist  = 55 + Math.random() * 90;
    const tx    = Math.cos(angle) * dist;
    const ty    = Math.sin(angle) * dist - 40;
    const rot   = Math.random() * 360 - 180;
    const size  = 13 + Math.random() * 13;
    const dur   = .75 + Math.random() * .5;
    const colors = ['#E88CA5','#A61E4D','#F8D7DA','#c04470'];

    Object.assign(el.style, {
      left:     `${x}px`,
      top:      `${y}px`,
      fontSize: `${size}px`,
      color:    colors[Math.floor(Math.random() * colors.length)],
    });
    el.style.setProperty('--tx',  `${tx}px`);
    el.style.setProperty('--ty',  `${ty}px`);
    el.style.setProperty('--rot', `${rot}deg`);
    el.style.setProperty('--dur', `${dur}s`);

    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  /* ── 8. Ambient floating hearts ──────────────────────────────────────── */
  const AMBIENT_HEARTS = ['❤', '♥', '❤', '♡', '❤'];

  function spawnAmbientHeart() {
    if (!heartsContainer) return;
    const el     = document.createElement('span');
    el.className = 'floating-heart';
    el.textContent = AMBIENT_HEARTS[Math.floor(Math.random() * AMBIENT_HEARTS.length)];

    const size   = 11 + Math.random() * 16;
    const dur    = 8  + Math.random() * 7;
    const sw     = (Math.random() - .5) * 150;
    const rot    = Math.random() * 360;
    const colors = ['#E88CA5','#A61E4D','rgba(232,140,165,.5)','#F8D7DA'];

    Object.assign(el.style, {
      left:     `${Math.random() * 100}%`,
      fontSize: `${size}px`,
      color:    colors[Math.floor(Math.random() * colors.length)],
    });
    el.style.setProperty('--dur', `${dur}s`);
    el.style.setProperty('--sw',  `${sw}px`);
    el.style.setProperty('--rot', `${rot}deg`);

    heartsContainer.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  // Adaptive spawn — more hearts on intro/final/banner sections
  setInterval(() => {
    const active = document.querySelector('.section.active');
    if (!active) { spawnAmbientHeart(); return; }
    const id = active.id;
    if (id === 'intro' || id === 'banner' || id === 'final-image' || id === 'final-text') {
      spawnAmbientHeart();
      if (Math.random() > .45) spawnAmbientHeart();
    } else if (Math.random() > .5) {
      spawnAmbientHeart();
    }
  }, 900);

  /* ── 9. Music toggle ──────────────────────────────────────────────────── */
  if (musicToggle) {
    musicToggle.addEventListener('click', () => {
      if (bgMusic) {
        if (bgMusic.paused) {
          bgMusic.play()
            .then(() => musicToggle.classList.add('playing'))
            .catch(() => musicToggle.classList.toggle('playing'));
        } else {
          bgMusic.pause();
          musicToggle.classList.remove('playing');
        }
      } else {
        musicToggle.classList.toggle('playing');
      }
    });
  }

})();
