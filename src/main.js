// ========================================
// SageSiren Link Hub - Enhanced JavaScript
// Modern interactions with micro-animations
// ========================================

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ========================================
// Theme Toggle with Smooth Transition
// ========================================
function initThemeToggle() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.className = savedTheme === 'dark' ? 'dark-mode' : 'light-mode';
  
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    updateToggleButton(toggleBtn, savedTheme);
    
    toggleBtn.addEventListener('click', (e) => {
      // Add ripple effect
      if (!prefersReducedMotion) {
        createRipple(e, toggleBtn);
      }
      
      const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      // Smooth theme transition
      document.body.style.transition = 'background 0.5s ease, color 0.5s ease';
      document.body.className = newTheme === 'dark' ? 'dark-mode' : 'light-mode';
      
      localStorage.setItem('theme', newTheme);
      updateToggleButton(toggleBtn, newTheme);
    });
  }
}

function updateToggleButton(btn, theme) {
  btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
}

// ========================================
// Ripple Effect for Buttons
// ========================================
function createRipple(event, element) {
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');
  
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);
  
  ripple.addEventListener('animationend', () => {
    ripple.remove();
  });
}

// ========================================
// Scroll Reveal Animation
// ========================================
function initScrollReveal() {
  if (prefersReducedMotion) return;
  
  const revealElements = document.querySelectorAll('.media-kit-section, .link-directory, .stats-card');
  
  const revealOnScroll = () => {
    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (elementTop < windowHeight - 100) {
        element.classList.add('revealed');
      }
    });
  };
  
  // Add reveal class for CSS
  revealElements.forEach(el => el.classList.add('reveal'));
  
  // Initial check
  revealOnScroll();
  
  // Throttled scroll listener
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        revealOnScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ========================================
// Enhanced Button Interactions
// ========================================
function initButtonEffects() {
  const buttons = document.querySelectorAll('.btn, .card-btn');
  
  buttons.forEach(btn => {
    // Add ripple on click
    btn.addEventListener('click', (e) => {
      if (!prefersReducedMotion) {
        createRipple(e, btn);
      }
    });
    
    // Add hover sound feedback (optional - uncomment if desired)
    // btn.addEventListener('mouseenter', () => playHoverSound());
  });
}

// ========================================
// Render Media Site Content
// ========================================
async function renderMediaSite() {
  try {
    // Load all data in parallel
    const [statsRes, mediaKitRes, linkRes] = await Promise.all([
      fetch('data/social.stats.json'),
      fetch('data/media.kit.json'),
      fetch('data/site.config.json')
    ]);
    
    const [statsJson, mediaKitJson, linksJson] = await Promise.all([
      statsRes.json(),
      mediaKitRes.json(),
      linkRes.json()
    ]);
    
    // Render stats cards with staggered animation
    renderStatsCards(statsJson);
    
    // Render About Me
    renderAbout(mediaKitJson);
    
    // Render links by category
    renderLinkCategories(linksJson);
    
    // Initialize scroll reveal after content is loaded
    setTimeout(() => {
      initScrollReveal();
      initButtonEffects();
    }, 100);
    
  } catch (error) {
    console.error('Error loading site data:', error);
    showErrorMessage();
  }
}

// ========================================
// Render Stats Cards
// ========================================
function renderStatsCards(statsJson) {
  const statsCards = document.getElementById('stats-cards');
  if (!statsCards || !statsJson.platforms) return;
  
  statsCards.innerHTML = statsJson.platforms.map((p, index) => `
    <div class="stats-card" 
         role="article" 
         aria-label="${p.platform} statistics"
         style="animation-delay: ${index * 0.1}s">
      <strong>${p.platform}</strong>
      <span aria-label="${p.followers} followers">
        ${formatNumber(p.followers)} followers
      </span>
    </div>
  `).join('');
}

// ========================================
// Render About Section
// ========================================
function renderAbout(mediaKitJson) {
  const about = document.querySelector('.about');
  if (!about || !mediaKitJson.about) return;
  
  const existingP = about.querySelector('p:last-of-type');
  if (existingP && !existingP.textContent.includes(mediaKitJson.about)) {
    about.innerHTML += `<p>${mediaKitJson.about}</p>`;
  }
}

// ========================================
// Render Link Categories
// ========================================
function renderLinkCategories(linksJson) {
  const linksDiv = document.getElementById('links-by-category');
  if (!linksDiv || !linksJson.linkCategories) return;
  
  linksDiv.innerHTML = Object.entries(linksJson.linkCategories)
    .map(([cat, btns], catIndex) => `
      <div class="category-group" 
           role="navigation" 
           aria-label="${cat} links"
           style="animation-delay: ${catIndex * 0.15}s">
        <h3 class="category-title">${cat}</h3>
        <div class="category-btns">
          ${btns.map((l, btnIndex) => `
            <a href="${l.url}" 
               class="btn" 
               target="_blank" 
               rel="noopener noreferrer" 
               aria-label="${l.label} - opens in new tab"
               style="animation-delay: ${(catIndex * 0.15) + (btnIndex * 0.05)}s">
              ${l.label}
            </a>
          `).join('')}
        </div>
      </div>
    `).join('');
}

// ========================================
// Utility Functions
// ========================================
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

function showErrorMessage() {
  const main = document.querySelector('main');
  if (main) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.innerHTML = `
      <p>Unable to load some content. Please refresh the page.</p>
    `;
    main.prepend(errorDiv);
  }
}

// ========================================
// Initialize on DOM Ready
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  renderMediaSite();
  
  // Add smooth scroll behavior
  document.documentElement.style.scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
});
