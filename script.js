(() => {
  'use strict';

  // Math utility helpers
  const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
  const mix = (a, b, t) => a + (b - a) * t;

  // DOM Elements - Pinned Flight Sequence
  const seq = document.getElementById('flight-sequence');
  const cloudsBackdrop = document.querySelector('.clouds-backdrop');
  const windowScene = document.querySelector('.window-scene');
  const portalBloom = document.querySelector('.portal-bloom');
  const jetScene = document.querySelector('.jet-scene');
  const heroIntro = document.querySelector('.hero-stage-intro');
  const heroAscent = document.querySelector('.hero-stage-ascent');
  const hudAltitude = document.querySelector('.hud-altitude');
  const caption = document.querySelector('.sequence-caption');
  const header = document.querySelector('.site-header');
  const floatingInquire = document.querySelector('.floating-inquire');

  let rafQueued = false;

  // --------------------------------------------------------------------------
  // 1. GSAP ScrollTrigger Initialization & Registration
  // --------------------------------------------------------------------------
  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({
      limitCallbacks: true,
      autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load,resize'
    });
  }

  // --------------------------------------------------------------------------
  // 2. Hero Flight Sequence GSAP Timeline
  // --------------------------------------------------------------------------
  function initHeroFlightGSAP() {
    if (!seq) return;

    if (!hasGSAP || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Fallback or reduced motion
      return;
    }

    const heroTL = gsap.timeline({
      id: 'heroFlightTimeline',
      scrollTrigger: {
        trigger: seq,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.45,
        fastScrollEnd: 3000,
        preventOverlaps: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          if (hudAltitude) {
            const currentAlt = Math.round(mix(12000, 51000, p));
            hudAltitude.textContent = `${currentAlt.toLocaleString()} FT`;
          }
          if (floatingInquire) {
            floatingInquire.style.opacity = p > 0.4 ? '1' : '0.85';
          }
        }
      }
    });

    // 1. Window Aperture - Moving through the window like a doorway into the sky
    // Camera pushes in (scale 1.0 -> 8.5) with power2.in easing (accelerating like walking through)
    heroTL.fromTo(
      windowScene,
      { scale: 1.0, opacity: 1 },
      { scale: 8.5, ease: 'power2.in', duration: 0.46 },
      0
    );
    // Window dissolves as the bezels push past the viewport boundaries (0.32 -> 0.46)
    heroTL.to(
      windowScene,
      { opacity: 0, ease: 'power1.in', duration: 0.14 },
      0.32
    );

    // 2. Portal Light Bloom - Soft exposure flare as you cross the threshold into open sunlight
    if (portalBloom) {
      heroTL.fromTo(
        portalBloom,
        { opacity: 0, scale: 0.9 },
        { opacity: 0.55, scale: 1.15, ease: 'power1.out', duration: 0.10 },
        0.30
      );
      heroTL.to(
        portalBloom,
        { opacity: 0, scale: 1.3, ease: 'power2.in', duration: 0.14 },
        0.40
      );
    }

    // 3. Stratosphere Clouds Parallax - Genuine depth outside the window
    heroTL.fromTo(
      cloudsBackdrop,
      { scale: 1.0, yPercent: 0, opacity: 0.85 },
      { scale: 1.14, yPercent: -5, opacity: 1.0, ease: 'none', duration: 1.0 },
      0
    );

    // 4. Jet Plane Ascent (Counter-scroll) into the open clouds
    heroTL.fromTo(
      jetScene,
      { xPercent: -5, yPercent: 16, scale: 1.25, rotation: -3.5, opacity: 0 },
      { xPercent: 4, yPercent: -6, scale: 1.0, rotation: 0.8, opacity: 1, ease: 'sine.inOut', duration: 0.34 },
      0.36
    );
    heroTL.to(
      jetScene,
      { opacity: 0, ease: 'power1.in', duration: 0.16 },
      0.82
    );

    // Hero Text Stage 1 (Intro)
    heroTL.fromTo(
      heroIntro,
      { opacity: 1, y: 0 },
      { opacity: 0, y: -42, ease: 'power1.out', duration: 0.22 },
      0
    );

    // Hero Text Stage 2 (Ascent in sky)
    heroTL.fromTo(
      heroAscent,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, ease: 'power1.out', duration: 0.16 },
      0.38
    );
    heroTL.to(
      heroAscent,
      { opacity: 0, ease: 'power1.in', duration: 0.14 },
      0.74
    );

    // Sequence Caption
    if (caption) {
      heroTL.fromTo(
        caption,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, ease: 'power1.out', duration: 0.12 },
        0.72
      );
      heroTL.to(
        caption,
        { opacity: 0, ease: 'power1.in', duration: 0.10 },
        0.88
      );
    }
  }

  // --------------------------------------------------------------------------
  // 3. Dedicated Cinematic Aircraft Journey GSAP Timeline
  // --------------------------------------------------------------------------
  const journeySection = document.querySelector('.aircraft-journey');
  const journeyClouds = document.querySelector('.journey-clouds-layer');
  const journeyPlane = document.querySelector('.journey-aircraft-container');
  const aircraftShadow = document.querySelector('.aircraft-shadow');
  const aircraftContrail = document.querySelector('.aircraft-contrail');
  const sceneIntro = document.querySelector('.scene-intro');
  const sceneReveal = document.querySelector('.scene-reveal');
  const sceneFlight = document.querySelector('.scene-flight');
  const sceneSpecs = document.querySelector('.scene-specs');
  const specItems = document.querySelectorAll('.journey-spec-item');
  const sceneInterior = document.querySelector('.scene-interior');
  const interiorAperture = document.querySelector('.interior-aperture-wrap');
  const statAlt = document.querySelector('.stat-alt');
  const telemetryCoords = document.querySelector('.telemetry-coords');

  function initAircraftJourneyGSAP() {
    if (!journeySection) return;

    if (!hasGSAP || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Reduced motion fallback
      if (sceneIntro) sceneIntro.style.opacity = '1';
      if (sceneReveal) sceneReveal.style.opacity = '1';
      if (sceneFlight) sceneFlight.style.opacity = '1';
      if (sceneSpecs) sceneSpecs.style.opacity = '1';
      if (sceneInterior) sceneInterior.style.opacity = '1';
      specItems.forEach(item => { item.style.opacity = '1'; item.style.transform = 'none'; });
      return;
    }

    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024 && !isMobile;
    const xMulti = isMobile ? 0.38 : (isTablet ? 0.72 : 1.0);
    const yMulti = isMobile ? 0.45 : 1.0;
    const baseScale = isMobile ? 0.65 : 1.0;

    // Build the master journey timeline
    const journeyTL = gsap.timeline({
      id: 'aircraftJourneyTimeline',
      scrollTrigger: {
        trigger: journeySection,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        fastScrollEnd: 3000,
        preventOverlaps: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;

          // Real-time Great Circle Telemetry Coordinates
          if (telemetryCoords) {
            const lat = (6.45 + (51.50 - 6.45) * p).toFixed(2);
            const lon = (3.39 + (-0.12 - 3.39) * p).toFixed(2);
            telemetryCoords.textContent = `${lat}° N   ${Math.abs(lon)}° ${lon < 0 ? 'W' : 'E'}`;
          }

          // Live Altitude in Scene 3
          if (statAlt) {
            const currentAlt = Math.round(47200 + (51000 - 47200) * clamp((p - 0.36) / 0.24));
            statAlt.textContent = `${currentAlt.toLocaleString()} FT`;
          }
        }
      }
    });

    // --- Layer A: Stratosphere Clouds Parallax & Scale ---
    if (journeyClouds) {
      journeyTL.fromTo(
        journeyClouds,
        { scale: 1.0, xPercent: 0, yPercent: 0, opacity: 0.20 },
        { scale: 1.18, xPercent: -6, yPercent: -4, opacity: 0.45, ease: 'none', duration: 1.0 },
        0
      );
    }

    // --- Layer B: Scene 1 (Intro) Exit ---
    if (sceneIntro) {
      journeyTL.fromTo(
        sceneIntro,
        { opacity: 1, y: 0 },
        { opacity: 0, y: -34, ease: 'power1.out', duration: 0.12 },
        0
      );
    }

    // --- Layer C: Scene 2 (Reveal & Approach) ---
    if (sceneReveal) {
      journeyTL.fromTo(
        sceneReveal,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, ease: 'power1.out', duration: 0.08 },
        0.14
      );
      journeyTL.to(
        sceneReveal,
        { opacity: 0, y: -20, ease: 'power1.in', duration: 0.06 },
        0.30
      );
    }

    // --- Layer D: Scene 3 (The Flying Aircraft Hero Moment) ---
    if (sceneFlight) {
      journeyTL.fromTo(
        sceneFlight,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, ease: 'power1.out', duration: 0.08 },
        0.36
      );
      journeyTL.to(
        sceneFlight,
        { opacity: 0, y: -20, ease: 'power1.in', duration: 0.06 },
        0.53
      );
    }

    // --- Layer E: Scene 4 (Aircraft Specifications Grid) ---
    if (sceneSpecs) {
      journeyTL.fromTo(
        sceneSpecs,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, ease: 'power1.out', duration: 0.06 },
        0.58
      );
      // Staggered reveal of individual specification items
      specItems.forEach((item, idx) => {
        journeyTL.fromTo(
          item,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, ease: 'power1.out', duration: 0.035 },
          0.60 + idx * 0.024
        );
      });
      journeyTL.to(
        sceneSpecs,
        { opacity: 0, y: -22, ease: 'power1.in', duration: 0.05 },
        0.78
      );
    }

    // --- Layer F: Scene 5 (Cabin Interior Aperture) ---
    if (sceneInterior && interiorAperture) {
      journeyTL.fromTo(
        sceneInterior,
        { opacity: 0 },
        { opacity: 1, duration: 0.06, ease: 'power1.out' },
        0.82
      );
      journeyTL.fromTo(
        interiorAperture,
        { opacity: 0, scale: 0.88 },
        { opacity: 1, scale: 1.0, ease: 'power2.out', duration: 0.08 },
        0.82
      );
      journeyTL.to(
        sceneInterior,
        { opacity: 0, duration: 0.03, ease: 'power1.in' },
        0.97
      );
    }

    // --- Layer G: Multi-Stage Aircraft Flight Trajectory ---
    if (journeyPlane) {
      // Starting State at p = 0
      gsap.set(journeyPlane, {
        x: `${38 * xMulti}vw`,
        y: `${-12 * yMulti}vh`,
        scale: 0.68 * baseScale,
        rotation: -3.5,
        opacity: 0.25,
        xPercent: -50,
        yPercent: -50
      });

      // Stage 1 (0.00 -> 0.14): Distant approach in upper-right
      journeyTL.to(
        journeyPlane,
        {
          x: `${28 * xMulti}vw`,
          y: `${-7 * yMulti}vh`,
          scale: 0.78 * baseScale,
          rotation: -2.2,
          opacity: 0.65,
          ease: 'sine.inOut',
          duration: 0.14
        },
        0
      );

      // Stage 2 (0.14 -> 0.36): Descending into forward visual quadrant
      journeyTL.to(
        journeyPlane,
        {
          x: `${10 * xMulti}vw`,
          y: `${3 * yMulti}vh`,
          scale: 0.94 * baseScale,
          rotation: -1.0,
          opacity: 1.0,
          ease: 'sine.inOut',
          duration: 0.22
        },
        0.14
      );

      // Contrail reveals during forward flight
      if (aircraftContrail) {
        journeyTL.fromTo(
          aircraftContrail,
          { opacity: 0 },
          { opacity: 0.6, duration: 0.10, ease: 'power1.out' },
          0.26
        );
      }

      // Stage 3 (0.36 -> 0.48): THE HERO MOMENT - Passing through visual dead center
      journeyTL.to(
        journeyPlane,
        {
          x: '0vw',
          y: `${-2 * yMulti}vh`,
          scale: 1.08 * baseScale,
          rotation: 0.0,
          opacity: 1.0,
          ease: 'power1.out',
          duration: 0.12
        },
        0.36
      );

      // Stage 4 (0.48 -> 0.60): Banking climb toward upper-left
      journeyTL.to(
        journeyPlane,
        {
          x: `${-14 * xMulti}vw`,
          y: `${-8 * yMulti}vh`,
          scale: 0.96 * baseScale,
          rotation: 2.2,
          opacity: 1.0,
          ease: 'sine.inOut',
          duration: 0.12
        },
        0.48
      );

      // Contrail softly dissipates
      if (aircraftContrail) {
        journeyTL.to(
          aircraftContrail,
          { opacity: 0, duration: 0.08, ease: 'power1.in' },
          0.52
        );
      }

      // Stage 5 (0.60 -> 0.78): High-altitude transition above specifications table
      journeyTL.to(
        journeyPlane,
        {
          x: `${22 * xMulti}vw`,
          y: `${-17 * yMulti}vh`,
          scale: 0.74 * baseScale,
          rotation: -1.2,
          opacity: 0.35,
          ease: 'power2.inOut',
          duration: 0.18
        },
        0.60
      );

      // Stage 6 (0.78 -> 0.86): Dissolving into the cabin sanctuary
      journeyTL.to(
        journeyPlane,
        {
          opacity: 0,
          ease: 'power2.in',
          duration: 0.08
        },
        0.78
      );
    }
  }

  // Header scroll detection
  window.addEventListener('scroll', () => {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }
  }, { passive: true });

  // Initialize GSAP Timelines on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initHeroFlightGSAP();
      initAircraftJourneyGSAP();
    });
  } else {
    initHeroFlightGSAP();
    initAircraftJourneyGSAP();
  }

  // Re-calculate responsive values on window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (hasGSAP) {
        ScrollTrigger.refresh();
      }
    }, 200);
  });

  // --------------------------------------------------------------------------
  // 4. Cabin Architecture Interactive Accordion
  // --------------------------------------------------------------------------
  const accordionCards = document.querySelectorAll('.accordion-card');
  const accordionImg = document.getElementById('accordion-img');
  const accordionCount = document.getElementById('accordion-count');

  const accordionAssets = [
    {
      src: './assets/cabin.jpg',
      alt: 'Acoustic serenity inside TRIOLINE luxury leather cabin suite'
    },
    {
      src: './assets/window.jpg',
      alt: 'Circadian lighting and fresh air panoramic jet window'
    },
    {
      src: './assets/jet.jpg',
      alt: 'Obsidian leather craftsmanship and bespoke engineering'
    },
    {
      src: './assets/clouds.jpg',
      alt: 'Uninterrupted Ka-band satellite broadband above the clouds'
    }
  ];

  accordionCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      // Close all cards
      accordionCards.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-expanded', 'false');
        const icon = c.querySelector('.acc-icon');
        if (icon) icon.textContent = '+';
      });

      // Activate clicked card
      card.classList.add('active');
      card.setAttribute('aria-expanded', 'true');
      const curIcon = card.querySelector('.acc-icon');
      if (curIcon) curIcon.textContent = '−';

      // Update image and counter
      if (accordionImg && accordionAssets[index]) {
        accordionImg.style.opacity = '0.25';
        setTimeout(() => {
          accordionImg.src = accordionAssets[index].src;
          accordionImg.alt = accordionAssets[index].alt;
          if (accordionCount) {
            accordionCount.textContent = `0${index + 1} / 04`;
          }
          accordionImg.style.opacity = '1';
        }, 160);
      }
    });

    // Keyboard accessibility
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // --------------------------------------------------------------------------
  // 5. Global Reach Interactive Route Matrix
  // --------------------------------------------------------------------------
  const hubBtns = document.querySelectorAll('.hub-btn');
  const targetCityEl = document.querySelector('.target-city');
  const targetCodeEl = document.querySelector('.target-code');
  const trajTimeEl = document.querySelector('.traj-time');
  const trajDistEl = document.querySelector('.traj-dist');
  const targetCoordsEl = document.querySelector('.target-coords');

  hubBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      hubBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const city = btn.dataset.city;
      const code = btn.dataset.code;
      const dist = btn.dataset.dist;
      const time = btn.dataset.time;
      const lat = btn.dataset.lat;
      const lon = btn.dataset.lon;

      if (targetCityEl) targetCityEl.innerHTML = `${city.toUpperCase()} <sup>${btn.querySelector('sup')?.textContent || ''}</sup>`;
      if (targetCodeEl) targetCodeEl.textContent = code;
      if (trajTimeEl) trajTimeEl.textContent = `${time} NON-STOP`;
      if (trajDistEl) trajDistEl.textContent = dist;
      if (targetCoordsEl) targetCoordsEl.textContent = `${lat}  ${lon}`;

      // Update inquiry destination field
      const destInput = document.getElementById('trip-destination');
      if (destInput) {
        destInput.value = `${city} (${code.split('/')[0].trim()})`;
        calculateFlightEstimates();
      }
    });
  });

  // --------------------------------------------------------------------------
  // 6. Comprehensive Flight Booking Suite & Live Estimator
  // --------------------------------------------------------------------------
  const inquiryForm = document.getElementById('flight-inquiry-form');
  const formFeedback = document.getElementById('form-feedback');
  const tripTabs = document.querySelectorAll('.trip-tab');
  const standardRouteFields = document.querySelector('.standard-route-fields');
  const returnDateRow = document.querySelector('.return-date-row');
  const returnDateInput = document.getElementById('trip-return-date');
  const originInput = document.getElementById('trip-origin');
  const destInput = document.getElementById('trip-destination');
  const aircraftSelect = document.getElementById('aircraft-tier');
  const passengersSelect = document.getElementById('trip-passengers');
  const dateInput = document.getElementById('trip-date');

  // Multi-City Elements
  const multiCityContainer = document.getElementById('multi-city-container');
  const multiLegsList = document.getElementById('multi-legs-list');
  const addLegBtn = document.getElementById('add-leg-btn');

  // Currency Switcher Elements
  const currBtns = document.querySelectorAll('.curr-btn');
  let currentCurrency = 'USD';
  const currencyTable = {
    USD: { symbol: '$', rate: 1.0, suffix: 'USD' },
    EUR: { symbol: '€', rate: 0.92, suffix: 'EUR' },
    GBP: { symbol: '£', rate: 0.79, suffix: 'GBP' },
    NGN: { symbol: '₦', rate: 1550, suffix: 'NGN' }
  };

  // Estimator HUD elements
  const valTime = document.querySelector('.val-time');
  const valDist = document.querySelector('.val-dist');
  const valAlt = document.querySelector('.val-alt');
  const valPrice = document.querySelector('.val-price');

  // Set default departure date to tomorrow
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }
  if (returnDateInput) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 5);
    returnDateInput.value = nextWeek.toISOString().split('T')[0];
  }

  // Dynamic Flight Distance Catalog (Nautical Miles)
  const routeDistances = {
    'lagos-london': 2750,
    'lagos-paris': 2560,
    'lagos-dubai': 3210,
    'lagos-new york': 4580,
    'lagos-tokyo': 7100,
    'lagos-geneva': 2620,
    'paris-nice': 370,
    'dubai-geneva': 2640,
    'london-nice': 560,
    'london-geneva': 420,
    'london-new york': 3000,
    'abuja-london': 2680,
    'abuja-dubai': 3100,
    'default': 2750
  };

  const aircraftData = {
    sovereign: { speedKts: 510, baseHourly: 7800, maxAlt: '51,000 FT', name: 'Trioline Sovereign Flagship' },
    continental: { speedKts: 480, baseHourly: 5900, maxAlt: '47,000 FT', name: 'Trioline Continental Heavy Jet' },
    executive: { speedKts: 440, baseHourly: 4200, maxAlt: '45,000 FT', name: 'Trioline Executive Midsize Jet' }
  };

  function getDistanceBetween(origin, dest) {
    const o = (origin || '').toLowerCase();
    const d = (dest || '').toLowerCase();
    for (const [key, dist] of Object.entries(routeDistances)) {
      if (key === 'default') continue;
      const [k1, k2] = key.split('-');
      if ((o.includes(k1) && d.includes(k2)) || (o.includes(k2) && d.includes(k1))) {
        return dist;
      }
    }
    return routeDistances.default;
  }

  // Multi-City Legs Data Structure
  let multiCityLegs = [
    { origin: 'Lagos (LOS / DNMM)', dest: 'London (FAB / EGLF)', date: '' },
    { origin: 'London (FAB / EGLF)', dest: 'Geneva (GVA / LSGG)', date: '' }
  ];

  function renderMultiCityLegs() {
    if (!multiLegsList) return;
    multiLegsList.innerHTML = '';

    multiCityLegs.forEach((leg, index) => {
      const legEl = document.createElement('div');
      legEl.className = 'multi-leg-row';
      legEl.innerHTML = `
        <div class="leg-index-badge">LEG 0${index + 1}</div>
        <div class="leg-inputs-grid">
          <div class="form-field">
            <label>FROM (ORIGIN)</label>
            <input type="text" class="leg-origin-input" data-index="${index}" value="${leg.origin}" placeholder="Origin Airport" required />
          </div>
          <div class="leg-arrow-div">✈</div>
          <div class="form-field">
            <label>TO (DESTINATION)</label>
            <input type="text" class="leg-dest-input" data-index="${index}" value="${leg.dest}" placeholder="Destination Airport" required />
          </div>
          <div class="form-field leg-date-field">
            <label>DATE</label>
            <input type="date" class="leg-date-input" data-index="${index}" value="${leg.date}" required />
          </div>
          ${multiCityLegs.length > 2 ? `
            <button type="button" class="remove-leg-btn" data-index="${index}" aria-label="Remove Leg 0${index + 1}">✕</button>
          ` : '<div class="leg-empty-space"></div>'}
        </div>
      `;
      multiLegsList.appendChild(legEl);
    });

    // Attach input listeners
    multiLegsList.querySelectorAll('.leg-origin-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        multiCityLegs[idx].origin = e.target.value;
        calculateFlightEstimates();
      });
    });

    multiLegsList.querySelectorAll('.leg-dest-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        multiCityLegs[idx].dest = e.target.value;
        // Auto-chain next leg origin if available
        if (idx + 1 < multiCityLegs.length) {
          multiCityLegs[idx + 1].origin = e.target.value;
          const nextOriginInput = multiLegsList.querySelector(`.leg-origin-input[data-index="${idx + 1}"]`);
          if (nextOriginInput) nextOriginInput.value = e.target.value;
        }
        calculateFlightEstimates();
      });
    });

    multiLegsList.querySelectorAll('.leg-date-input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        multiCityLegs[idx].date = e.target.value;
      });
    });

    multiLegsList.querySelectorAll('.remove-leg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        if (multiCityLegs.length > 2) {
          multiCityLegs.splice(idx, 1);
          renderMultiCityLegs();
          calculateFlightEstimates();
        }
      });
    });
  }

  if (addLegBtn) {
    addLegBtn.addEventListener('click', () => {
      if (multiCityLegs.length >= 5) return;
      const lastDest = multiCityLegs[multiCityLegs.length - 1].dest || 'London (FAB / EGLF)';
      multiCityLegs.push({
        origin: lastDest,
        dest: 'Dubai (DWC / OMDW)',
        date: ''
      });
      renderMultiCityLegs();
      calculateFlightEstimates();
    });
  }

  // Trip Mode Tabs (One-Way, Round-Trip, Multi-City)
  let currentTripType = 'one-way';
  let isDiscountedEmptyLeg = false;

  tripTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tripTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      currentTripType = tab.dataset.trip;

      if (currentTripType === 'multi-city') {
        if (standardRouteFields) standardRouteFields.style.display = 'none';
        if (multiCityContainer) multiCityContainer.style.display = 'block';
        renderMultiCityLegs();
      } else {
        if (multiCityContainer) multiCityContainer.style.display = 'none';
        if (standardRouteFields) standardRouteFields.style.display = 'block';

        if (currentTripType === 'round-trip') {
          if (returnDateRow) returnDateRow.style.display = 'grid';
          if (returnDateInput) returnDateInput.required = true;
        } else {
          if (returnDateRow) returnDateRow.style.display = 'none';
          if (returnDateInput) returnDateInput.required = false;
        }
      }
      calculateFlightEstimates();
    });
  });

  // Frequent Route Corridor Preset Quick-Buttons
  const routePresetBtns = document.querySelectorAll('.route-preset-btn');
  routePresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      routePresetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const origin = btn.dataset.origin;
      const dest = btn.dataset.dest;

      if (currentTripType === 'multi-city') {
        multiCityLegs[0].origin = origin;
        multiCityLegs[0].dest = dest;
        if (multiCityLegs.length > 1) {
          multiCityLegs[1].origin = dest;
        }
        renderMultiCityLegs();
      } else {
        if (originInput) originInput.value = origin;
        if (destInput) destInput.value = dest;
      }
      isDiscountedEmptyLeg = false;
      calculateFlightEstimates();
    });
  });

  // Currency Switcher
  currBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCurrency = btn.dataset.curr || 'USD';
      calculateFlightEstimates();
    });
  });

  // Empty-Leg Corridor Claiming
  const emptyLegCards = document.querySelectorAll('.empty-leg-card');
  emptyLegCards.forEach(card => {
    const claimBtn = card.querySelector('.claim-empty-btn');
    const triggerClaim = () => {
      const origin = card.dataset.origin;
      const dest = card.dataset.dest;
      const craft = card.dataset.aircraft;

      if (originInput) originInput.value = origin;
      if (destInput) destInput.value = dest;
      if (aircraftSelect) aircraftSelect.value = craft;

      // Set trip type to one-way for empty-leg
      tripTabs.forEach(t => t.classList.toggle('active', t.dataset.trip === 'one-way'));
      if (multiCityContainer) multiCityContainer.style.display = 'none';
      if (standardRouteFields) standardRouteFields.style.display = 'block';
      if (returnDateRow) returnDateRow.style.display = 'none';
      if (returnDateInput) returnDateInput.required = false;
      currentTripType = 'one-way';

      isDiscountedEmptyLeg = true;
      calculateFlightEstimates();

      // Scroll to booking form
      const formCard = document.querySelector('.inquire-form-card');
      if (formCard) {
        formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        formCard.classList.add('flash-highlight');
        setTimeout(() => formCard.classList.remove('flash-highlight'), 1200);
      }

      const clientNameInput = document.getElementById('client-name');
      if (clientNameInput) clientNameInput.focus();
    };

    if (claimBtn) {
      claimBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerClaim();
      });
    }
    card.addEventListener('click', triggerClaim);
  });

  // Dynamic Flight Estimator Calculation
  function calculateFlightEstimates() {
    const craftKey = (aircraftSelect ? aircraftSelect.value : 'sovereign') || 'sovereign';
    const craftInfo = aircraftData[craftKey] || aircraftData.sovereign;
    const curr = currencyTable[currentCurrency] || currencyTable.USD;

    let totalDist = 0;
    let timeLabelSuffix = 'NON-STOP';

    if (currentTripType === 'multi-city') {
      multiCityLegs.forEach(leg => {
        totalDist += getDistanceBetween(leg.origin, leg.dest);
      });
      timeLabelSuffix = `(${multiCityLegs.length} LEGS)`;
    } else {
      const originStr = originInput ? originInput.value : '';
      const destStr = destInput ? destInput.value : '';
      let dist = getDistanceBetween(originStr, destStr);

      if (currentTripType === 'round-trip') {
        totalDist = dist * 2;
        timeLabelSuffix = '(TOTAL RT)';
      } else {
        totalDist = dist;
      }
    }

    const hoursDecimal = totalDist / craftInfo.speedKts;
    const hrs = Math.floor(hoursDecimal);
    const mins = Math.round((hoursDecimal - hrs) * 60);
    const timeDisplay = `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;

    // Pricing calculation in USD then convert to active currency
    let baseCostUSD = hoursDecimal * craftInfo.baseHourly;
    if (isDiscountedEmptyLeg && currentTripType === 'one-way') {
      baseCostUSD *= 0.55; // 45% discount on empty legs
    }

    const lowUSD = baseCostUSD * 0.95;
    const highUSD = baseCostUSD * 1.15;

    const lowConverted = Math.round((lowUSD * curr.rate) / 500) * 500;
    const highConverted = Math.round((highUSD * curr.rate) / 500) * 500;

    // Update DOM
    if (valTime) valTime.textContent = `${timeDisplay} ${timeLabelSuffix}`;
    if (valDist) valDist.textContent = `${totalDist.toLocaleString()} NM`;
    if (valAlt) valAlt.textContent = craftInfo.maxAlt;
    if (valPrice) {
      if (isDiscountedEmptyLeg) {
        valPrice.innerHTML = `<span class="discount-pill">-45% EMPTY-LEG</span> ${curr.symbol}${lowConverted.toLocaleString()} – ${curr.symbol}${highConverted.toLocaleString()} ${curr.suffix}`;
      } else {
        valPrice.textContent = `${curr.symbol}${lowConverted.toLocaleString()} – ${curr.symbol}${highConverted.toLocaleString()} ${curr.suffix}`;
      }
    }
  }

  // Recalculate on any input change
  [originInput, destInput, aircraftSelect, passengersSelect].forEach(el => {
    if (el) {
      el.addEventListener('change', () => {
        isDiscountedEmptyLeg = false;
        calculateFlightEstimates();
      });
      el.addEventListener('input', calculateFlightEstimates);
    }
  });

  // Calculate initial estimates
  calculateFlightEstimates();

  // --------------------------------------------------------------------------
  // 7. Fleet Comparison Modal Handling
  // --------------------------------------------------------------------------
  const fleetCompareModal = document.getElementById('fleet-compare-modal');
  const openFleetCompareBtn = document.getElementById('open-fleet-compare-btn');
  const compareCloseBtn = fleetCompareModal?.querySelector('.compare-close-btn');
  const compareBackdrop = fleetCompareModal?.querySelector('.modal-backdrop');

  function openFleetCompare() {
    if (!fleetCompareModal) return;
    fleetCompareModal.classList.add('open');
    fleetCompareModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeFleetCompare() {
    if (!fleetCompareModal) return;
    fleetCompareModal.classList.remove('open');
    fleetCompareModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (openFleetCompareBtn) openFleetCompareBtn.addEventListener('click', openFleetCompare);
  if (compareCloseBtn) compareCloseBtn.addEventListener('click', closeFleetCompare);
  if (compareBackdrop) compareBackdrop.addEventListener('click', closeFleetCompare);

  // Select aircraft tier from comparison modal
  const selectFleetTierBtns = document.querySelectorAll('.select-fleet-tier-btn');
  selectFleetTierBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tier = btn.dataset.tier;
      if (aircraftSelect) {
        aircraftSelect.value = tier;
        calculateFlightEstimates();
      }
      closeFleetCompare();
      const formCard = document.querySelector('.inquire-form-card');
      if (formCard) {
        formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        formCard.classList.add('flash-highlight');
        setTimeout(() => formCard.classList.remove('flash-highlight'), 1200);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 8. VIP Flight Itinerary Briefing Modal Handling
  // --------------------------------------------------------------------------
  const itineraryModal = document.getElementById('itinerary-modal');
  const modalCloseBtn = itineraryModal?.querySelector('.modal-close-btn');
  const modalBackdrop = itineraryModal?.querySelector('.modal-backdrop');

  function openItineraryModal(formData) {
    if (!itineraryModal) return;

    const refCode = `TT-${Math.floor(1000 + Math.random() * 9000)}-VIP`;
    const craftKey = formData.get('aircraft_tier') || 'sovereign';
    const craftName = aircraftData[craftKey]?.name || 'Trioline Sovereign Flagship';
    const clientName = formData.get('client_name') || 'Valued Principal';
    const dining = formData.get('dining_preference') || 'Michelin Haute Cuisine';
    const luggage = formData.get('luggage_profile') || 'Executive Hold';

    let origin = formData.get('origin');
    let dest = formData.get('destination');
    let depDate = formData.get('departure_date') || 'Immediate Confirmation';

    if (currentTripType === 'multi-city') {
      origin = multiCityLegs[0]?.origin || 'Lagos (LOS)';
      dest = multiCityLegs[multiCityLegs.length - 1]?.dest || 'Dubai (DWC)';
      depDate = `Multi-Leg (${multiCityLegs.length} Flight Sectors)`;
    }

    const slotTime = formData.get('departure_time') || 'Afternoon';
    const pax = formData.get('passengers') || '5 – 8 Guests';
    const quote = valPrice ? valPrice.textContent : '$48,000 – $58,000 USD';

    // Populate modal
    const refEl = document.getElementById('dossier-ref');
    const originEl = itineraryModal.querySelector('.dossier-origin');
    const destEl = itineraryModal.querySelector('.dossier-dest');
    const craftEl = itineraryModal.querySelector('.dossier-aircraft-name');
    const dateEl = itineraryModal.querySelector('.dossier-date');
    const timeEl = itineraryModal.querySelector('.dossier-time');
    const paxEl = itineraryModal.querySelector('.dossier-pax');
    const quoteEl = itineraryModal.querySelector('.dossier-quote');
    const durationEl = itineraryModal.querySelector('.dossier-duration');
    const amenitiesContainer = document.getElementById('dossier-amenities-list');

    if (refEl) refEl.textContent = refCode;
    if (originEl) originEl.textContent = origin;
    if (destEl) destEl.textContent = dest;
    if (craftEl) craftEl.textContent = craftName;
    if (dateEl) dateEl.textContent = depDate;
    if (timeEl) timeEl.textContent = slotTime.charAt(0).toUpperCase() + slotTime.slice(1);
    if (paxEl) paxEl.textContent = `${pax} Guests`;
    if (quoteEl) quoteEl.textContent = quote;
    if (durationEl && valTime) durationEl.textContent = valTime.textContent;

    // Collect checked amenities + dining + cargo
    if (amenitiesContainer) {
      amenitiesContainer.innerHTML = '';
      const checkedBoxes = inquiryForm.querySelectorAll('.amenity-checkbox input:checked');
      checkedBoxes.forEach(chk => {
        const txt = chk.parentElement.querySelector('.amenity-text')?.textContent || '';
        if (txt) {
          const tag = document.createElement('span');
          tag.className = 'amenity-tag';
          tag.textContent = txt;
          amenitiesContainer.appendChild(tag);
        }
      });

      // Add dining & cargo tags
      const diningTag = document.createElement('span');
      diningTag.className = 'amenity-tag';
      diningTag.textContent = `Dining: ${dining}`;
      amenitiesContainer.appendChild(diningTag);

      const luggageTag = document.createElement('span');
      luggageTag.className = 'amenity-tag';
      luggageTag.textContent = `Cargo: ${luggage}`;
      amenitiesContainer.appendChild(luggageTag);
    }

    // Dynamic WhatsApp Link with pre-filled flight dispatch details
    const whatsappBtn = itineraryModal.querySelector('.whatsapp-btn');
    if (whatsappBtn) {
      const waMsg = encodeURIComponent(
        `Hello TRIOLINE TRAVELS Flight Concierge,\n\nI have submitted my flight clearance request.\n• Dossier Ref: ${refCode}\n• Principal: ${clientName}\n• Route: ${origin} → ${dest}\n• Aircraft: ${craftName}\n• Estimate: ${quote}\n• Schedule: ${depDate}\n\nPlease advise on immediate tarmac clearance and flight dispatch.`
      );
      whatsappBtn.href = `https://wa.me/442079460880?text=${waMsg}`;
    }

    // Open modal
    itineraryModal.classList.add('open');
    itineraryModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeItineraryModal() {
    if (!itineraryModal) return;
    itineraryModal.classList.remove('open');
    itineraryModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeItineraryModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeItineraryModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (itineraryModal?.classList.contains('open')) closeItineraryModal();
      if (fleetCompareModal?.classList.contains('open')) closeFleetCompare();
    }
  });

  // Form Submit Handler
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(inquiryForm);
      const origin = formData.get('origin') || (currentTripType === 'multi-city' ? multiCityLegs[0]?.origin : '');
      const destination = formData.get('destination') || (currentTripType === 'multi-city' ? multiCityLegs[multiCityLegs.length - 1]?.dest : '');
      const name = formData.get('client_name');

      // Open official VIP itinerary modal dossier
      openItineraryModal(formData);

      if (formFeedback) {
        formFeedback.className = 'form-feedback success';
        formFeedback.innerHTML = `
          <strong>VIP Flight Clearance Initiated:</strong><br />
          Thank you, ${name}. Your flight charter corridor (${origin} → ${destination}) has been securely dispatched to the TRIOLINE TRAVELS Global Operations Control. Your dedicated Flight Director has been assigned.
        `;
        formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      const submitBtn = inquiryForm.querySelector('.submit-inquiry-btn');
      if (submitBtn) {
        submitBtn.innerHTML = `<span>Dispatched to Flight Director</span> <b>✓</b>`;
        submitBtn.style.opacity = '0.9';
      }
    });
  }

  // --------------------------------------------------------------------------
  // 8. Mobile Navigation Drawer
  // --------------------------------------------------------------------------
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileDrawer = document.getElementById('mobile-menu');
  const drawerCloseBtn = document.querySelector('.drawer-close-btn');

  function toggleMobileMenu(open) {
    if (!mobileDrawer || !menuToggle) return;
    const shouldOpen = typeof open === 'boolean' ? open : !mobileDrawer.classList.contains('open');
    mobileDrawer.classList.toggle('open', shouldOpen);
    menuToggle.classList.toggle('open', shouldOpen);
    menuToggle.setAttribute('aria-expanded', String(shouldOpen));
    mobileDrawer.setAttribute('aria-hidden', String(!shouldOpen));
    document.body.style.overflow = shouldOpen ? 'hidden' : '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => toggleMobileMenu());
  }
  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', () => toggleMobileMenu(false));
  }
  if (mobileDrawer) {
    mobileDrawer.querySelectorAll('.drawer-link').forEach(link => {
      link.addEventListener('click', () => toggleMobileMenu(false));
    });
  }

  // --------------------------------------------------------------------------
  // 9. Interactive Luxury Magnetic Pointer Orb (Desktop only)
  // --------------------------------------------------------------------------
  const orb = document.querySelector('.luxury-orb');
  const orbLabel = document.querySelector('.luxury-orb .orb-label');

  if (orb && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let orbX = mouseX;
    let orbY = mouseY;
    let isTicking = false;

    window.addEventListener('pointermove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      orb.classList.add('visible');
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      orb.classList.remove('visible');
    });

    function renderOrb() {
      orbX += (mouseX - orbX) * 0.18;
      orbY += (mouseY - orbY) * 0.18;
      orb.style.left = `${orbX.toFixed(1)}px`;
      orb.style.top = `${orbY.toFixed(1)}px`;
      requestAnimationFrame(renderOrb);
    }
    requestAnimationFrame(renderOrb);

    // Contextual Hover States
    document.querySelectorAll('a, button, .accordion-card, .metric-card, .spec-cell, .journey-spec-item, .interior-link, .empty-leg-card').forEach(el => {
      el.addEventListener('pointerenter', () => {
        orb.classList.add('hovering');
        if (orbLabel) {
          if (el.classList.contains('accordion-card')) {
            orbLabel.textContent = 'EXPLORE';
          } else if (el.classList.contains('journey-spec-item')) {
            orbLabel.textContent = 'SPECS';
          } else if (el.classList.contains('interior-link')) {
            orbLabel.textContent = 'INTERIOR';
          } else if (el.classList.contains('empty-leg-card') || el.classList.contains('claim-empty-btn')) {
            orbLabel.textContent = 'CLAIM';
          } else if (el.classList.contains('hub-btn')) {
            orbLabel.textContent = 'CORRIDOR';
          } else if (el.tagName === 'A' || el.tagName === 'BUTTON') {
            orbLabel.textContent = 'DISCOVER';
          }
        }
      });

      el.addEventListener('pointerleave', () => {
        orb.classList.remove('hovering');
        if (orbLabel) {
          orbLabel.textContent = 'EXPLORE';
        }
      });
    });
  }
})();
