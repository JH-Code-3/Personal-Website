// Scroll to top instantly on load (scrollRestoration set to manual in <head>)
document.documentElement.style.scrollBehavior = 'auto';
window.scrollTo(0, 0);
document.documentElement.style.scrollBehavior = '';

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

    // Auto-scroll to hero every time the video ends
    vid.addEventListener('ended', () => {
        videoHasEnded = true;
        veil.classList.add('visible');
        slowScrollTo(document.getElementById('hero'), 2200);
        setTimeout(() => { veil.classList.remove('visible'); }, 1200);
    });

    // Replay video when user scrolls all the way back to the top after having scrolled down
    let wasScrolledDown = false;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) wasScrolledDown = true;
        if (videoHasEnded && wasScrolledDown && window.scrollY < 10) {
            videoHasEnded = false;
            wasScrolledDown = false;
            vid.currentTime = 0;
            vid.play().catch(() => {});
        }
    }, { passive: true });
}

// Top nav: frosted glass on scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Sidebar + top nav active state
const topLinks  = document.querySelectorAll('.nav-links a');
const sideItems = document.querySelectorAll('.side-nav-item');

const trackedSections = [
    document.getElementById('intro'),
    ...document.querySelectorAll('section[id]')
];

function updateActiveSection() {
    const scrollMid = window.scrollY + window.innerHeight * 0.35;
    let activeId = trackedSections[0].id;
    trackedSections.forEach(el => {
        if (el.offsetTop <= scrollMid) activeId = el.id;
    });
    topLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + activeId);
    });
    sideItems.forEach(item => {
        item.classList.toggle('active', item.dataset.target === activeId);
    });
}

window.addEventListener('scroll', updateActiveSection, { passive: true });
updateActiveSection();

// Sidebar click to scroll + briefly show label on mobile tap
let tapLabelTimer = null;
sideItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = document.getElementById(item.dataset.target);
        if (target) target.scrollIntoView({ behavior: 'smooth' });

        // Show label on tap (useful on mobile where there's no hover)
        sideItems.forEach(i => i.classList.remove('tapped'));
        item.classList.add('tapped');
        clearTimeout(tapLabelTimer);
        tapLabelTimer = setTimeout(() => item.classList.remove('tapped'), 1800);
    });
});

// Intercept all internal anchor links so they don't write a hash to the URL
// (a hash in the URL causes the browser to jump there on refresh)
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.getElementById(link.getAttribute('href').slice(1));
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

// Hamburger menu
const hamburger = document.getElementById('nav-hamburger');
const navLinks  = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
    });
});

// Back-to-top button with footer avoidance
const backToTop = document.getElementById('back-to-top');
const footer    = document.querySelector('footer');

window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);

    const defaultBottom = 36;
    const btnH = backToTop.offsetHeight || 42;
    const footerTop = footer.getBoundingClientRect().top;
    if (footerTop < window.innerHeight - defaultBottom - btnH) {
        backToTop.style.bottom = (window.innerHeight - footerTop + 12) + 'px';
    } else {
        backToTop.style.bottom = '';
    }
}, { passive: true });

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
