// main.js
// Loads stats and links from JSON, renders sections
// Light/Dark mode toggle with localStorage persistence

// Theme toggle functionality
function initThemeToggle() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.className = savedTheme === 'dark' ? 'dark-mode' : 'light-mode';
    
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        updateToggleButton(toggleBtn, savedTheme);
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
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

// Render media site content
async function renderMediaSite() {
    try {
        // Load stats
        const statsRes = await fetch('data/social.stats.json');
        const statsJson = await statsRes.json();
        const mediaKitRes = await fetch('data/media.kit.json');
        const mediaKitJson = await mediaKitRes.json();
        const linkRes = await fetch('data/site.config.json');
        const linksJson = await linkRes.json();

        // Render stats cards with accessibility improvements
        const statsCards = document.getElementById('stats-cards');
        if(statsCards && statsJson.platforms) {
            statsCards.innerHTML = statsJson.platforms.map(p => 
                `<div class='stats-card' role='article' aria-label='${p.platform} statistics'>
                    <strong>${p.platform}</strong><br>
                    <span aria-label='${p.followers} followers'>${p.followers.toLocaleString()} followers</span>
                </div>`
            ).join("");
        }
        
        // Render About Me
        const about = document.querySelector('.about');
        if(about && mediaKitJson.about) {
            const existingP = about.querySelector('p:last-of-type');
            if (existingP && !existingP.textContent.includes(mediaKitJson.about)) {
                about.innerHTML += `<p>${mediaKitJson.about}</p>`;
            }
        }
        
        // Render links by category with accessibility
        const linksDiv = document.getElementById('links-by-category');
        if(linksDiv && linksJson.linkCategories) {
            linksDiv.innerHTML = Object.entries(linksJson.linkCategories)
                .map(([cat, btns]) => 
                    `<div class='category-group' role='navigation' aria-label='${cat} links'>
                        <h3 class='category-title'>${cat}</h3>
                        <div class='category-btns'>
                            ${btns.map(l => 
                                `<a href='${l.url}' class='btn' target='_blank' rel='noopener noreferrer' aria-label='${l.label} - opens in new tab'>${l.label}</a>`
                            ).join("")}
                        </div>
                    </div>`
                ).join("");
        }
    } catch (error) {
        console.error('Error loading site data:', error);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    renderMediaSite();
});