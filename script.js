function toggleTheme() {
    const body = document.body;
    const toggleButton = document.getElementById('mode-toggle');
    body.classList.toggle('light-mode');

    if (body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
        toggleButton.textContent = '☀️';
        toggleButton.title = 'Toggle light/dark mode';
    } else {
        localStorage.setItem('theme', 'dark');
        toggleButton.textContent = '🌙';
        toggleButton.title = 'Toggle dark/light mode';
    }
}

function checkTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('mode-toggle').textContent = '☀️';
        document.getElementById('mode-toggle').title = 'Toggle dark/light mode';
    } else {
        document.getElementById('mode-toggle').textContent = '🌙';
        document.getElementById('mode-toggle').title = 'Toggle light/dark mode';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkTheme();
    document.getElementById('mode-toggle').addEventListener('click', toggleTheme);
});


(function () {
    const canvas = document.getElementById('bg');
    const ctx = canvas.getContext('2d');
    const particles = [];
    const NUM_PARTICLES = 100;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticles() {
        for (let i = 0; i < NUM_PARTICLES; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5),
                vy: (Math.random() - 0.5),
                radius: Math.random() * 2 + 1
            });
        }
    }

    function animateParticles() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0ff";

        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(animateParticles);
    }

    resizeCanvas();
    createParticles();
    animateParticles();

    window.addEventListener('resize', resizeCanvas);
})();


async function fetchRepos(username = 'tenkdotolami') {
    const container = document.getElementById('repo-list');
    container.textContent = 'Loading repositories...';

    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const repos = await response.json();
        if (!repos.length) {
            container.innerHTML = '<p>No public repositories found.</p>';
            return;
        }

        container.innerHTML = '';
        for (const repo of repos) {
            const repoEl = document.createElement('div');
            repoEl.className = 'repo';
            repoEl.innerHTML = `
        <h3><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h3>
        <p>${repo.description || 'No description provided.'}</p>
        <p class="stars">⭐ Stars: ${repo.stargazers_count}</p>
      `;
            container.appendChild(repoEl);
        }
    } catch (err) {
        container.innerHTML = `<p>Error loading repos: ${err.message}</p>`;
    }
}


function revealOnScroll(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    const triggerPoint = window.innerHeight / 1.5;

    function checkScroll() {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < triggerPoint) {
            element.classList.add('visible');
            window.removeEventListener('scroll', checkScroll);
        }
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll(); // trigger once on load
}


function updateActiveSection() {
    const sections = [
        document.querySelector('main.content'),
        document.getElementById('skills'),
        document.getElementById('repos')
    ];

    const viewportHeight = window.innerHeight;
    const visibilityData = [];

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();

        if (rect.bottom <= 0 || rect.top >= viewportHeight) {
            visibilityData.push({ section, ratio: 0 });
            return;
        }

        const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        const visibleRatio = visibleHeight / viewportHeight;

        visibilityData.push({ section, ratio: visibleRatio });
    });

    // Sort sections by visibility (highest first)
    visibilityData.sort((a, b) => b.ratio - a.ratio);

    const top = visibilityData[0];
    const second = visibilityData[1];

    const fadeBase = 0.2;
    const fadeRunnerUp = 0.6;
    const fadeActive = 1.0;
    const blendThreshold = 0.15; // difference ratio before we "blend"

    // Reset all sections to base state
    sections.forEach(section => {
        section.style.opacity = fadeBase;
        section.classList.remove('active');
        section.style.pointerEvents = 'none';
    });

    if (top.ratio - second.ratio < blendThreshold) {
        // Gentle transition: top and second visible
        top.section.style.opacity = fadeActive;
        top.section.classList.add('active');
        top.section.style.pointerEvents = 'auto';

        second.section.style.opacity = fadeRunnerUp;
        second.section.classList.add('active');
        second.section.style.pointerEvents = 'auto';
    } else {
        // Clear winner
        top.section.style.opacity = fadeActive;
        top.section.classList.add('active');
        top.section.style.pointerEvents = 'auto';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    fetchRepos();
    revealOnScroll('skills');
    revealOnScroll('repos');
    updateActiveSection();

    window.addEventListener('scroll', updateActiveSection);
    window.addEventListener('resize', updateActiveSection);
});


window.addEventListener('scroll', updateActiveSection);
window.addEventListener('resize', updateActiveSection);
