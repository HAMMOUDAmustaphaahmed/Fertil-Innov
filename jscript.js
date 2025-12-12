
// Script pour le header modernisé
document.addEventListener('DOMContentLoaded', function() {
  const header = document.getElementById('header');
  const menuTrigger = document.getElementById('menuTrigger');
  const nav = document.querySelector('.header-area-modern .nav');
  const navOverlay = document.getElementById('navOverlay');
  const navLinks = document.querySelectorAll('.header-area-modern .nav a');

  // Gestion du scroll pour l'effet sticky
  window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }

    // Mise à jour des liens actifs
    updateActiveNavLink();
  });

  // Gestion du menu mobile
  menuTrigger.addEventListener('click', function() {
    menuTrigger.classList.toggle('active');
    nav.classList.toggle('active');
    navOverlay.classList.toggle('active');
    document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
  });

  // Fermer le menu en cliquant sur l'overlay
  navOverlay.addEventListener('click', function() {
    menuTrigger.classList.remove('active');
    nav.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
  });

  // Fermer le menu en cliquant sur un lien (mobile)
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Empêcher le comportement par défaut seulement pour les ancres
      if (this.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          // Fermer le menu mobile si ouvert
          if (window.innerWidth <= 991) {
            menuTrigger.classList.remove('active');
            nav.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
          }
          
          // Scroll vers la section cible
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
          });
          
          // Mettre à jour la classe active
          navLinks.forEach(l => l.classList.remove('active'));
          this.classList.add('active');
        }
      }
    });
  });

  // Fonction pour mettre à jour le lien actif basé sur la position de défilement
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    let foundActive = false;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
            foundActive = true;
          }
        });
      }
    });

    // Si aucune section n'est active, activer le lien "Accueil"
    if (!foundActive && scrollPos < 500) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#top') {
          link.classList.add('active');
        }
      });
    }
  }

  // Animation d'entrée progressive
  const navItems = document.querySelectorAll('.header-area-modern .nav li');
  navItems.forEach((item, index) => {
    item.style.animationDelay = `${0.1 + index * 0.05}s`;
  });

  // Initialisation
  updateActiveNavLink();
});