// ============================================
// FERTIL'INNOV - JAVASCRIPT GLOBAL
// ============================================

const FertilInnov = (function() {
  'use strict';

  const CONFIG = {
    loaderDuration: 2500,
    scrollThreshold: 100,
    animationDelay: 100
  };

  const state = {
    isMenuOpen: false,
    currentModal: null,
    scrollPosition: 0
  };

  const utils = {
    debounce: (fn, delay) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
      };
    },
    throttle: (fn, limit) => {
      let inThrottle;
      return (...args) => {
        if (!inThrottle) {
          fn.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },
    prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  // ===== LOADER =====
  const initLoader = () => {
    const loader = document.getElementById('loader');
    if (!loader) return;
    const hide = () => {
      loader.classList.add('hide');
      setTimeout(() => {
        loader.hidden = true;
        document.body.style.overflow = '';
      }, 500);
    };
    const minTimer = setTimeout(hide, CONFIG.loaderDuration);
    if (document.readyState === 'complete') {
      clearTimeout(minTimer);
      hide();
    } else {
      window.addEventListener('load', () => {
        clearTimeout(minTimer);
        hide();
      }, { once: true });
    }
  };

  // ===== NAVIGATION =====
  const initNavigation = () => {
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');

    const handleScroll = utils.throttle(() => {
      if (header) header.classList.toggle('scrolled', window.scrollY > CONFIG.scrollThreshold);
      document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          const rect = target.getBoundingClientRect();
          const isActive = rect.top <= 150 && rect.bottom >= 150;
          link.classList.toggle('active', isActive);
          link.setAttribute('aria-current', isActive ? 'page' : 'false');
        }
      });
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    if (menuToggle && mobileNav) {
      const toggleMenu = (forceClose = false) => {
        state.isMenuOpen = forceClose ? false : !state.isMenuOpen;
        menuToggle.classList.toggle('active', state.isMenuOpen);
        menuToggle.setAttribute('aria-expanded', String(state.isMenuOpen));
        mobileNav.classList.toggle('is-open', state.isMenuOpen);
        document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
      };

      menuToggle.addEventListener('click', () => toggleMenu());
      document.addEventListener('click', (e) => {
        if (state.isMenuOpen && !e.target.closest('#header')) toggleMenu(true);
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && state.isMenuOpen) toggleMenu(true);
      });
      mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => toggleMenu(true));
      });
    }
  };

  // ===== EXPERTISE - TILT 3D =====
  const initExpertise = () => {
    document.querySelectorAll('.expertise-card[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        card.style.setProperty('--rotateX', `${rotateX}deg`);
        card.style.setProperty('--rotateY', `${rotateY}deg`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rotateX', '0deg');
        card.style.setProperty('--rotateY', '0deg');
      });
    });
  };

  // ===== FAQ =====
  const initFAQ = () => {
    document.querySelectorAll('.faq-item').forEach(item => {
      const summary = item.querySelector('.faq-question');
      if (!summary) return;
      summary.addEventListener('click', () => {
        if (!item.open) {
          document.querySelectorAll('.faq-item[open]').forEach(openItem => {
            if (openItem !== item) openItem.removeAttribute('open');
          });
        }
      });
    });
  };

  // ===== TÉMOIGNAGES - CARROUSEL =====
  const initTestimonials = () => {
    const track = document.querySelector('.testimonials-track');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const indicatorsContainer = document.querySelector('.carousel-indicators');
    if (!track) return;

    const cards = track.querySelectorAll('.testimonial-card');
    const totalCards = cards.length;

    const getVisibleSlides = () => {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 640) return 2;
      return 1;
    };

    let visibleSlides = getVisibleSlides();
    let currentIndex = 0;
    let maxIndex = Math.max(0, totalCards - visibleSlides);

    const createIndicators = () => {
      if (!indicatorsContainer) return;
      indicatorsContainer.innerHTML = '';
      const numIndicators = Math.ceil(totalCards / visibleSlides);
      for (let i = 0; i < numIndicators; i++) {
        const indicator = document.createElement('button');
        indicator.className = 'indicator' + (i === 0 ? ' active' : '');
        indicator.setAttribute('role', 'tab');
        indicator.setAttribute('aria-label', `Aller au groupe ${i + 1}`);
        indicator.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        indicator.addEventListener('click', () => {
          currentIndex = i * visibleSlides;
          scrollToCurrent();
        });
        indicatorsContainer.appendChild(indicator);
      }
    };

    const scrollToCurrent = () => {
      const cardWidth = cards[0].offsetWidth + 24;
      track.scrollTo({ left: currentIndex * cardWidth, behavior: 'smooth' });
      updateButtons();
      updateIndicators();
    };

    const updateButtons = () => {
      if (prevBtn) prevBtn.disabled = currentIndex <= 0;
      if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
    };

    const updateIndicators = () => {
      if (!indicatorsContainer) return;
      const activeIndicator = Math.floor(currentIndex / visibleSlides);
      indicatorsContainer.querySelectorAll('.indicator').forEach((ind, i) => {
        ind.classList.toggle('active', i === activeIndicator);
        ind.setAttribute('aria-selected', i === activeIndicator ? 'true' : 'false');
      });
    };

    prevBtn?.addEventListener('click', () => {
      currentIndex = Math.max(0, currentIndex - 1);
      scrollToCurrent();
    });

    nextBtn?.addEventListener('click', () => {
      currentIndex = Math.min(maxIndex, currentIndex + 1);
      scrollToCurrent();
    });

    let startX = 0;
    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX - track.offsetLeft;
    }, { passive: true });
    track.addEventListener('touchend', () => {
      const cardWidth = cards[0].offsetWidth + 24;
      currentIndex = Math.round(track.scrollLeft / cardWidth);
      currentIndex = Math.max(0, Math.min(maxIndex, currentIndex));
      scrollToCurrent();
    });

    window.addEventListener('resize', utils.debounce(() => {
      visibleSlides = getVisibleSlides();
      maxIndex = Math.max(0, totalCards - visibleSlides);
      currentIndex = Math.min(currentIndex, maxIndex);
      createIndicators();
      scrollToCurrent();
    }, 250));

    createIndicators();
    updateButtons();
  };

  // ===== FORMATIONS =====
  const initFormations = () => {
    const accordion = document.querySelector('.formations-accordion');
    if (!accordion) return;
    const items = accordion.querySelectorAll('.formation-item');
    items.forEach(item => {
      const header = item.querySelector('.formation-header');
      const content = item.querySelector('.formation-content');
      if (!header || !content) return;
      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        items.forEach(other => {
          if (other !== item) {
            other.classList.remove('is-open');
            other.querySelector('.formation-header')?.setAttribute('aria-expanded', 'false');
            const c = other.querySelector('.formation-content');
            if (c) c.hidden = true;
          }
        });
        item.classList.toggle('is-open', !isOpen);
        header.setAttribute('aria-expanded', String(!isOpen));
        content.hidden = isOpen;
      });
    });
    if (items[0]) {
      items[0].classList.add('is-open');
      items[0].querySelector('.formation-header')?.setAttribute('aria-expanded', 'true');
      const fc = items[0].querySelector('.formation-content');
      if (fc) fc.hidden = false;
    }
  };

  // ===== STATISTIQUES =====
  const initStats = () => {
    const counters = document.querySelectorAll('[data-target]');
    if (!counters.length) return;

    const animateCounter = (el) => {
      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const duration = 2000;
      const startTime = performance.now();

      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(ease * target);
        el.textContent = current + suffix;
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target + suffix;
        }
      };
      requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  };

  // ===== PARTENAIRES =====
  const initPartners = () => {
    document.querySelectorAll('.partners-track').forEach(track => {
      track.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
      track.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
      track.addEventListener('focusin', () => { track.style.animationPlayState = 'paused'; });
      track.addEventListener('focusout', () => { track.style.animationPlayState = 'running'; });
    });
  };

  // ===== BLOG =====
  const initBlog = () => {
    document.querySelectorAll('.blog-link').forEach(link => {
      if (link.hostname !== location.hostname) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  };

  // ===== ÉQUIPE =====
  const initTeam = () => {
    document.querySelectorAll('.flip-card').forEach(card => {
      const toggleFlip = () => card.classList.toggle('flipped');
      card.addEventListener('click', toggleFlip);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFlip(); }
      });
      card.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'transform' && card.classList.contains('flipped')) {
          setTimeout(() => card.classList.remove('flipped'), 4000);
        }
      });
    });
  };

  // ===== CONTACT =====
  const initContact = () => {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');
    if (!form) return;

    const validate = () => {
      const name = form.querySelector('[name="name"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const message = form.querySelector('[name="message"]').value.trim();
      const honeypot = form.querySelector('[name="website"]').value;
      if (honeypot) return { valid: false, error: 'Spam détecté' };
      if (!name || !email || !message) return { valid: false, error: 'Tous les champs obligatoires doivent être remplis' };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { valid: false, error: 'Email invalide' };
      return { valid: true };
    };

    const loadScript = (src) => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src; script.onload = resolve; script.onerror = reject;
      document.head.appendChild(script);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const validation = validate();
      if (!validation.valid) {
        status.className = 'form-status error';
        status.textContent = validation.error;
        return;
      }
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      status.style.display = 'none';
      try {
        if (typeof emailjs === 'undefined') {
          await loadScript('https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js');
          emailjs.init('YOUR_PUBLIC_KEY');
        }
        await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
          from_name: form.name.value, from_email: form.email.value,
          subject: form.subject.value, phone: form.phone.value || 'Non renseigné',
          message: form.message.value, to_email: 's.soussou@fertilinnov-environnement.com'
        });
        status.className = 'form-status success';
        status.textContent = '✓ Message envoyé avec succès ! Nous vous répondrons dans les 48h.';
        form.reset();
      } catch (error) {
        status.className = 'form-status error';
        status.textContent = '✗ Erreur d\'envoi. Veuillez réessayer ou nous contacter directement.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
      }
    });
  };

  // ===== FOOTER / BACK TO TOP =====
  const initFooter = () => {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  // ===== ACTIVITÉS - MODAL =====
  const initActivities = () => {
    const grid = document.getElementById('activitiesGrid');
    const modal = document.getElementById('activityModal');
    if (!grid || !modal) return;

    const activitiesData = {
      approche: {
        title: 'Notre Approche Exclusive',
        image: '../assets/images/facts2.jpg',
        content: `
          <div class="detail-grid">
            <div class="detail-text">
              <h4>Méthodologie Rigoureuse de Diagnostic</h4>
              <p>Notre approche repose sur une méthodologie scientifique rigoureuse permettant d'évaluer précisément l'état initial des milieux anthropisés.</p>
              <h5>Observation Détaillée des Sites</h5>
              <ul>
                <li><strong>Caractérisation visuelle et topographique</strong> des sols et structures présentes</li>
                <li><strong>Identification des signes de dégradation</strong> : érosion, compactage, pollution visible, salinisation</li>
                <li><strong>Analyse de l'historique du site</strong> : utilisations passées, impacts industriels</li>
              </ul>
              <h5>Évaluation de la Diversité Biologique</h5>
              <p>Inventaire des espèces végétales spontanées et de leur capacité à coloniser le milieu. Identification moléculaire via analyses microbiologiques avancées.</p>
              <h5>Propriétés des Sols</h5>
              <ul>
                <li><strong>Biologiques</strong> : activité microbienne, symbioses racinaires, matière organique</li>
                <li><strong>Chimiques</strong> : composition, pH, éléments nutritifs</li>
                <li><strong>Physiques</strong> : texture, structure, capacité de rétention d'eau</li>
              </ul>
            </div>
            <div class="detail-visual">
              <img src="../assets/images/facts2.jpg" alt="Analyse de sol en laboratoire">
              <div class="detail-stats">
                <div class="stat-box"><span class="stat-number">1-2</span><span class="stat-label">mois d'analyse</span></div>
                <div class="stat-box"><span class="stat-number">100%</span><span class="stat-label">personnalisé</span></div>
              </div>
            </div>
          </div>
        `
      },
      microorganismes: {
        title: 'Chasseurs de Microorganismes',
        image: '../assets/images/facts3.jpg',
        content: `
          <div class="detail-grid">
            <div class="detail-text">
              <h4>Microbial Intelligence Avancée</h4>
              <p>Nous développons des solutions de diagnostics des sols basées sur l'analyse de la flore microbienne pour améliorer la fertilisation des sols.</p>
              <h5>Analyses Microbiologiques</h5>
              <ul>
                <li><strong>Isolation et sélection</strong> de microorganismes bénéfiques (champignons, bactéries symbiotiques)</li>
                <li><strong>Quantification des microorganismes</strong> à partir de diverses sources</li>
                <li><strong>Identification moléculaire</strong> par séquençage à haut débit</li>
                <li><strong>Caractérisation de l'abondance et diversité</strong> des communautés microbiennes</li>
              </ul>
              <h5>Notre Banque de Souches</h5>
              <ul>
                <li><strong>5000+ souches certifiées</strong> (partenariat INRAE/CBS)</li>
                <li><strong>Bactéries fixatrices d'azote</strong> : Rhizobium leguminosarum, Frankia alni</li>
                <li><strong>PGPR</strong> : Bacillus subtilis, Pseudomonas fluorescens</li>
                <li><strong>Champignons mycorhiziens</strong> : Funneliformis mosseae, Rhizophagus irregularis</li>
              </ul>
            </div>
            <div class="detail-visual">
              <img src="../assets/images/facts3.jpg" alt="Cultures microbiennes en laboratoire">
              <div class="detail-stats">
                <div class="stat-box"><span class="stat-number">5000+</span><span class="stat-label">souches</span></div>
                <div class="stat-box"><span class="stat-number">2-5</span><span class="stat-label">mois d'analyse</span></div>
              </div>
            </div>
          </div>
        `
      },
      biofertilisation: {
        title: 'Biofertilisation Intelligente',
        image: '../assets/images/facts5.jpg',
        content: `
          <div class="detail-grid">
            <div class="detail-text">
              <h4>Agriculture Régénérative Innovante</h4>
              <p>Nous accompagnons les exploitations agricoles dans l'optimisation de la fertilité des sols en favorisant les interactions biologiques naturelles.</p>
              <h5>Solutions de Fertilisation Biologique</h5>
              <ul>
                <li><strong>Biostimulation des symbioses racinaires</strong> pour améliorer la nutrition azotée</li>
                <li><strong>Nutrition minérale optimisée</strong> (P, K, Fe) via champignons mycorhiziens et PGPR</li>
                <li><strong>Amélioration de l'absorption des nutriments</strong> par les plantes</li>
                <li><strong>Réduction de l'usage des engrais chimiques</strong> de 70%</li>
              </ul>
              <h5>Notre Engagement Éco+</h5>
              <ul>
                <li><strong>-70% de besoins en eau</strong> grâce aux mycorhizes</li>
                <li><strong>0 intrants chimiques</strong> : solutions 100% biologiques</li>
                <li><strong>+40% biodiversité</strong> en 18 mois</li>
              </ul>
            </div>
            <div class="detail-visual">
              <img src="../assets/images/facts5.jpg" alt="Plantes avec symbioses racinaires">
              <div class="detail-stats">
                <div class="stat-box"><span class="stat-number">+40%</span><span class="stat-label">rendement</span></div>
                <div class="stat-box"><span class="stat-number">-70%</span><span class="stat-label">eau</span></div>
              </div>
            </div>
          </div>
        `
      },
      rehabilitation: {
        title: 'Réhabilitation Écologique',
        image: '../assets/images/facts4.jpg',
        content: `
          <div class="detail-grid">
            <div class="detail-text">
              <h4>Intervention en Milieux Anthropisés</h4>
              <p>Nous intervenons sur les sites industriels en activité ou en déprise, ainsi que les zones urbaines et périurbaines.</p>
              <h5>Stratégie de Réhabilitation</h5>
              <ul>
                <li><strong>Création de technosol fertile</strong> avec amendements adaptés</li>
                <li><strong>Activation de la vie microbienne</strong> : inoculation de microorganismes bénéfiques</li>
                <li><strong>Phytostabilisation</strong> : plantes + microbes immobilisent polluants</li>
                <li><strong>Bioaccumulation</strong> : -80% concentration en 24 mois</li>
              </ul>
              <h5>Mise en Place de Couverts Végétaux</h5>
              <p>Critères de sélection : adaptation au climat, rôle écologique, durabilité des écosystèmes.</p>
            </div>
            <div class="detail-visual">
              <img src="../assets/images/facts4.jpg" alt="Site réhabilité avec végétation">
              <div class="detail-stats">
                <div class="stat-box"><span class="stat-number">3-5</span><span class="stat-label">mois projet</span></div>
                <div class="stat-box"><span class="stat-number">80%</span><span class="stat-label">polluants réduits</span></div>
              </div>
            </div>
          </div>
        `
      },
      innovation: {
        title: 'Innovation Continue & Recherche',
        image: '../assets/images/facts1.jpg',
        content: `
          <div class="detail-grid">
            <div class="detail-text">
              <h4>Recherche & Développement Permanent</h4>
              <p>Fertil'Innov investit continuellement dans la recherche pour développer des solutions innovantes.</p>
              <h5>Notre Laboratoire</h5>
              <ul>
                <li><strong>Équipe pluridisciplinaire</strong> : microbiologistes, agronomes, écologues</li>
                <li><strong>Équipement avancé</strong> : microscopie, séquençage ADN, cultures cellulaires</li>
                <li><strong>Serres expérimentales</strong> : tests en conditions contrôlées</li>
              </ul>
              <h5>Certifications</h5>
              <ul>
                <li><strong>ISO 14001</strong> : Gestion environnementale</li>
                <li><strong>ISO 14064-2</strong> : Quantification GES</li>
                <li><strong>Agriculture Biologique UE</strong> : Conformité AB</li>
              </ul>
            </div>
            <div class="detail-visual">
              <img src="../assets/images/facts1.jpg" alt="Laboratoire de recherche">
              <div class="detail-stats">
                <div class="stat-box"><span class="stat-number">100%</span><span class="stat-label">certifié</span></div>
                <div class="stat-box"><span class="stat-number">24/7</span><span class="stat-label">support</span></div>
              </div>
            </div>
          </div>
        `
      }
    };

    grid.querySelectorAll('.activity-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      });
    });

    const openModal = (activityKey) => {
      const data = activitiesData[activityKey];
      if (!data) return;
      state.scrollPosition = window.pageYOffset;
      document.getElementById('modalTitle').textContent = data.title;
      document.getElementById('modalBody').innerHTML = data.content;
      modal.hidden = false;
      void modal.offsetWidth;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      modal.querySelector('.modal-close').focus();
      state.currentModal = activityKey;
    };

    const closeModal = () => {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.hidden = true;
        document.getElementById('modalBody').innerHTML = '';
        document.body.style.overflow = '';
        window.scrollTo({ top: state.scrollPosition, behavior: 'auto' });
      }, 300);
      state.currentModal = null;
    };

    grid.querySelectorAll('.activity-card').forEach(card => {
      const key = card.dataset.activity;
      card.addEventListener('click', () => openModal(key));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(key);
        }
      });
    });

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.currentModal) closeModal();
    });
  };

  // ===== INIT GLOBALE =====
  const init = () => {
    if (utils.prefersReducedMotion()) {
      document.documentElement.classList.add('reduce-motion');
    }
    initLoader();

    const runModules = () => {
      initNavigation();
      initActivities();
      initExpertise();
      initFAQ();
      initTestimonials();
      initFormations();
      initStats();
      initPartners();
      initBlog();
      initTeam();
      initContact();
      initFooter();
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runModules);
    } else {
      runModules();
    }
  };

  return { init, utils, state };
})();

FertilInnov.init();