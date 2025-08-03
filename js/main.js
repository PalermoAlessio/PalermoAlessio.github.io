// Main application - Coordinates all modules
class PortfolioApp {
  constructor() {
    this.currentLanguage = this.getStoredLanguage();
    this.translations = null;
    this.projects = null;
    this.init();
  }

  async init() {
    try {
      // Load data
      await Promise.all([
        this.loadTranslations(),
        this.loadProjects()
      ]);

      // Initialize modules
      this.initTheme();
      this.initLanguage();
      this.initAnimations();

      // Populate dynamic content
      this.populateContent();

      

      // Setup event listeners
      this.setupEventListeners();

      console.log('Portfolio loaded successfully');
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }

  async loadTranslations() {
    try {
      const response = await fetch('data/translations.json');
      this.translations = await response.json();
    } catch (error) {
      console.error('Error loading translations:', error);
      this.translations = { it: {}, en: {} };
    }
  }

  async loadProjects() {
    try {
      const response = await fetch(`data/projects.json?v=${new Date().getTime()}`);
      this.projects = await response.json();
    } catch (error) {
      console.error('Error loading projects:', error);
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

    // Update language selector
    const currentLangEl = document.getElementById('current-lang');
    if (currentLangEl) {
      currentLangEl.textContent = lang.toUpperCase();
    }

    // Update all elements with data-translate
    this.updateTranslations();

    // Update meta tags
    this.updateMetaTags(lang);

    // Update project schema
    this.updateProjectSchema(lang);

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

  updateProjectSchema(lang) {
    if (!this.projects || !this.projects.projects) return;

    // Remove previous schema if exists
    const existingSchema = document.getElementById('project-schema');
    if (existingSchema) {
      existingSchema.remove();
    }

    const schema = {
      "@context": "https://schema.org",
      "@graph": this.projects.projects.map(project => ({
        "@type": "SoftwareApplication",
        "name": project.title,
        "description": project.description[lang] || project.description.it,
        "author": {
          "@type": "Person",
          "name": "Alessio Palermo"
        },
        "programmingLanguage": project.technologies,
        "codeRepository": project.github
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'project-schema';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
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
    const imageSrc = `/images/${project.imageOptimized || project.image}`;
    const altText = `${project.title} - ${description}`;

    return `
      <a href="${githubLink}" target="_blank" rel="noopener noreferrer" class="project-card bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg block cursor-pointer hover:transform hover:translate-y-[-4px] hover:shadow-lg transition-all duration-300">
        <img src="${imageSrc}" 
             alt="${altText}"
             class="w-full aspect-video rounded-lg mb-3 object-cover"
             loading="lazy"
             decoding="async">
        <h4 class="text-lg font-semibold mb-2">${project.title}</h4>
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
    // Fade-in animations on scroll
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

    // Add fade-in class to elements you want to animate
    const animatedElements = document.querySelectorAll('section, .project-card');
    animatedElements.forEach(el => {
      el.classList.add('fade-in');
      observer.observe(el);
    });
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
        this.populateContent(); // Reload dynamic content
        this.initLazyLoading(); // Re-initialize lazy loading for new images
        langMenu.classList.add('hidden');
      }
    });

    // Close language menu on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#lang-button') && !e.target.closest('#lang-menu')) {
        langMenu?.classList.add('hidden');
      }
    });

    // Smooth scrolling for anchor links
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

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new PortfolioApp());
} else {
  new PortfolioApp();
}