// Force video play
const vid = document.getElementById('hero-video');
if (vid) {
    vid.muted = true;
    vid.play().catch(() => {
        document.addEventListener('click',      () => vid.play(), { once: true });
        document.addEventListener('touchstart', () => vid.play(), { once: true });
    });
    vid.addEventListener('error', () => {
        document.getElementById('intro').style.background = '#1a0000';
        console.error('Video failed to load. Make sure Ronin.mp4 is in the same folder as index.html.');
    });

    const veil = document.getElementById('intro-veil');
    let videoHasEnded = false;

    // Custom slow scroll — easeInOutQuad easing
    function slowScrollTo(target, duration) {
        const startY = window.pageYOffset;
        const endY = target.getBoundingClientRect().top + startY;
        const startTime = performance.now();
        function ease(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }
        function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            window.scrollTo(0, startY + (endY - startY) * ease(progress));
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    // Fade veil and begin scroll simultaneously the moment video ends
    vid.addEventListener('ended', () => {
        videoHasEnded = true;
        veil.classList.add('visible');
        slowScrollTo(document.getElementById('hero'), 2200);
        setTimeout(() => { veil.classList.remove('visible'); }, 1200);
    });

    // Replay video when user scrolls back up to the intro section
    const introObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && videoHasEnded) {
                videoHasEnded = false;
                vid.currentTime = 0;
                vid.play().catch(() => {});
            }
        });
    }, { threshold: 0.3 });
    introObserver.observe(document.getElementById('intro'));
}

// Top nav: frosted glass on scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Sidebar + top nav active state
const sections  = document.querySelectorAll('section[id]');
const topLinks  = document.querySelectorAll('.nav-links a');
const sideItems = document.querySelectorAll('.side-nav-item');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        topLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
        sideItems.forEach(item => {
            item.classList.toggle('active', item.dataset.target === id);
        });
    });
}, { threshold: 0.4 });
sections.forEach(s => sectionObserver.observe(s));

// Sidebar click to scroll
sideItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = document.getElementById(item.dataset.target);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObserver.observe(el));
