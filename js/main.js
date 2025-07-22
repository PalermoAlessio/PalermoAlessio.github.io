// Main application - Coordina tutti i moduli
class PortfolioApp {
  constructor() {
    this.currentLanguage = this.getStoredLanguage();
    this.translations = null;
    this.projects = null;
    this.init();
  }

  async init() {
    try {
      // Carica i dati
      await Promise.all([
        this.loadTranslations(),
        this.loadProjects()
      ]);

      // Inizializza i moduli
      this.initTheme();
      this.initLanguage();
      this.initAnimations();

      // Popola il contenuto dinamico
      this.populateContent();

      // Inizializza il lazy loading dopo aver popolato il contenuto
      this.initLazyLoading();

      // Setup event listeners
      this.setupEventListeners();

      console.log('Portfolio caricato con successo');
    } catch (error) {
      console.error('Errore durante l\'inizializzazione:', error);
    }
  }

  async loadTranslations() {
    try {
      const response = await fetch('data/translations.json');
      this.translations = await response.json();
    } catch (error) {
      console.error('Errore caricamento traduzioni:', error);
      this.translations = { it: {}, en: {} };
    }
  }

  async loadProjects() {
    try {
      const response = await fetch(`data/projects.json?v=${new Date().getTime()}`);
      this.projects = await response.json();
    } catch (error) {
      console.error('Errore caricamento progetti:', error);
      this.projects = { projects: [] };
    }
  }

  getStoredLanguage() {
    const stored = localStorage.getItem('language');
    if (stored) return stored;

    const browserLang = navigator.language.split('-')[0];
    return ['it', 'en'].includes(browserLang) ? browserLang : 'it';
  }

  initTheme() {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');

    this.setTheme(theme);
  }

  setTheme(theme) {
    const html = document.documentElement;
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');

    if (theme === 'dark') {
      html.classList.add('dark');
      darkIcon?.classList.add('hidden');
      lightIcon?.classList.remove('hidden');
    } else {
      html.classList.remove('dark');
      darkIcon?.classList.remove('hidden');
      lightIcon?.classList.add('hidden');
    }

    localStorage.setItem('theme', theme);
  }

  initLanguage() {
    this.setLanguage(this.currentLanguage);
  }

  setLanguage(lang) {
    if (!this.translations || !this.translations[lang]) return;

    this.currentLanguage = lang;
    document.documentElement.lang = lang;

    // Aggiorna selector lingua
    const currentLangEl = document.getElementById('current-lang');
    if (currentLangEl) {
      currentLangEl.textContent = lang.toUpperCase();
    }

    // Aggiorna tutti gli elementi con data-translate
    this.updateTranslations();

    // Aggiorna meta tags
    this.updateMetaTags(lang);

    localStorage.setItem('language', lang);
  }

  updateTranslations() {
    const elements = document.querySelectorAll('[data-translate]');
    const translations = this.translations[this.currentLanguage];

    elements.forEach(el => {
      const key = el.getAttribute('data-translate');
      const translation = this.getNestedValue(translations, key);
      if (translation) {
        el.textContent = translation;
      }
    });
  }

  updateMetaTags(lang) {
    const translations = this.translations[lang];
    if (!translations.meta) return;

    if (translations.meta.title) {
      document.title = translations.meta.title;
    }

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && translations.meta.description) {
      metaDesc.content = translations.meta.description;
    }
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  populateContent() {
    this.populateExperience();
    this.populateSkills();
    this.populateProjects();
  }

  populateExperience() {
    const list = document.getElementById('experience-list');
    if (!list || !this.translations) return;

    const experiences = this.translations[this.currentLanguage]?.sections?.experience?.items || [];
    list.innerHTML = experiences.map(exp => `<li>${exp}</li>`).join('');
  }

  populateSkills() {
    const list = document.getElementById('skills-list');
    if (!list || !this.translations) return;

    const skills = this.translations[this.currentLanguage]?.sections?.skills?.items || [];
    list.innerHTML = skills.map(skill => `<li>${skill}</li>`).join('');
  }

  populateProjects() {
    const grid = document.getElementById('portfolio-grid');
    if (!grid || !this.projects) return;

    const projects = this.projects.projects || [];
    grid.innerHTML = projects.map(project => this.createProjectCard(project)).join('');
  }

  createProjectCard(project) {
    const description = project.description[this.currentLanguage] || project.description.it || 'Descrizione non disponibile';
    const githubLink = project.github || 'https://github.com/PalermoAlessio/placeholder-project'; // Placeholder for missing GitHub links

    return `
      <a href="${githubLink}" target="_blank" rel="noopener noreferrer" class="project-card bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg block cursor-pointer hover:transform hover:translate-y-[-4px] hover:shadow-lg transition-all duration-300">
        <div class="lazy-bg w-full aspect-video rounded-lg mb-3"
             data-bg="/images/${project.imageOptimized || project.image}"
             data-bg-fallback="/images/${project.image}">
        </div>
        <h3 class="text-lg font-semibold mb-2">${project.title}</h3>
        <p class="text-gray-600 dark:text-gray-300 text-sm mb-3">${description}</p>
        <div class="flex flex-wrap gap-2 mb-3">
          ${(project.technologies || []).map(tech =>
            `<span class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">${tech}</span>`
          ).join('')}
        </div>
        
      </a>
    `;
  }

  initAnimations() {
    // Effetto shrink header al scroll
    const headerImage = document.getElementById('header-image');
    if (headerImage) {
      const initialHeight = 400;

      window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        const newHeight = Math.max(initialHeight - scrollY, 0);
        headerImage.style.height = `${newHeight}px`;
      }, { passive: true });
    }

    // Animazioni fade-in al scroll
    this.setupScrollAnimations();
  }

  setupScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    // Aggiungi classe fade-in agli elementi che vuoi animare
    const animatedElements = document.querySelectorAll('section, .project-card');
    animatedElements.forEach(el => {
      el.classList.add('fade-in');
      observer.observe(el);
    });
  }

  initLazyLoading() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: carica tutto subito
      this.loadAllImages();
      return;
    }

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadLazyImage(entry.target);
          imageObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.lazy-bg').forEach(img => {
      imageObserver.observe(img);
    });
  }

  loadLazyImage(element) {
    const bgImage = element.getAttribute('data-bg');
    const fallback = element.getAttribute('data-bg-fallback');

    console.log('loadLazyImage called for element:', element);
    console.log('data-bg:', bgImage);
    console.log('data-bg-fallback:', fallback);

    if (!bgImage) {
      console.log('No data-bg attribute found, returning.');
      return;
    }

    // Testa se WebP è supportato
    const supportsWebP = this.supportsWebP();
    const imageUrl = supportsWebP ? bgImage : (fallback || bgImage);
    console.log('WebP supported:', supportsWebP);
    console.log('Final image URL:', imageUrl);

    const img = new Image();
    img.onload = () => {
      console.log('Image loaded successfully:', imageUrl);
      element.style.setProperty('--bg-image', `url(${imageUrl})`);
      element.classList.add('loaded');
      console.log('Loaded class added and --bg-image set.');
    };
    img.onerror = () => {
      console.error('Error loading image:', imageUrl);
      if (fallback && imageUrl !== fallback) {
        console.log('Attempting to load fallback image:', fallback);
        // Riprova con fallback
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          console.log('Fallback image loaded successfully:', fallback);
          element.style.setProperty('--bg-image', `url(${fallback})`);
          element.classList.add('loaded');
          console.log('Loaded class added and --bg-image set for fallback.');
        };
        fallbackImg.onerror = () => {
          console.error('Error loading fallback image:', fallback);
          element.classList.add('error'); // Add an error class for visual feedback
        };
        fallbackImg.src = fallback;
      } else {
        element.classList.add('error'); // Add an error class for visual feedback
      }
    };
    img.src = imageUrl;
  }

  loadAllImages() {
    document.querySelectorAll('.lazy-bg').forEach(img => {
      this.loadLazyImage(img);
    });
  }

  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  setupEventListeners() {
    // Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      const currentTheme = localStorage.getItem('theme') || 'light';
      this.setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    // Language selector
    const langButton = document.getElementById('lang-button');
    const langMenu = document.getElementById('lang-menu');

    langButton?.addEventListener('click', (e) => {
      e.stopPropagation();
      langMenu?.classList.toggle('hidden');
    });

    langMenu?.addEventListener('click', (e) => {
      const lang = e.target.getAttribute('data-lang');
      if (lang) {
        this.setLanguage(lang);
        this.populateContent(); // Ricarica il contenuto dinamico
        this.initLazyLoading(); // Re-inizializza il lazy loading per le nuove immagini
        langMenu.classList.add('hidden');
      }
    });

    // Chiudi menu lingua al click esterno
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#lang-button') && !e.target.closest('#lang-menu')) {
        langMenu?.classList.add('hidden');
      }
    });

    // Smooth scrolling per anchor links
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

// Inizializza l'app quando il DOM è pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new PortfolioApp());
} else {
  new PortfolioApp();
}