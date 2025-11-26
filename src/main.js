// main.js
// Loads stats and links from JSON, renders sections
async function renderMediaSite() {
    // Load stats
    const statsRes = await fetch('data/social.stats.json');
    const statsJson = await statsRes.json();
    const mediaKitRes = await fetch('data/media.kit.json');
    const mediaKitJson = await mediaKitRes.json();
    const linkRes = await fetch('data/site.config.json');
    const linksJson = await linkRes.json();

    // Render stats cards
    const statsCards = document.getElementById('stats-cards');
    if(statsCards && statsJson.platforms) {
        statsCards.innerHTML = statsJson.platforms.map(p => `<div class='stats-card'><b>${p.platform}</b><br>${p.followers} followers</div>`).join("");
    }
    // Render About Me (insert into .about)
    const about = document.querySelector('.about');
    if(about && mediaKitJson.about) {
        about.innerHTML += `<p>${mediaKitJson.about}</p>`;
    }
    // Render links by category
    const linksDiv = document.getElementById('links-by-category');
    if(linksDiv && linksJson.linkCategories) {
        linksDiv.innerHTML = Object.entries(linksJson.linkCategories)
            .map(([cat, btns]) => `<div><b>${cat}</b><div class='category-btns'>${btns.map(l => `<a href='${l.url}' class='btn' target='_blank'>${l.label}</a>`).join("")}</div></div>`) 
            .join("");
    }
}
document.addEventListener('DOMContentLoaded', renderMediaSite);