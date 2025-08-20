document.addEventListener('DOMContentLoaded', function() {

    // --- 1. MOBILE MENU TOGGLE LOGIC ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const hamburgerIcon = document.querySelector('.hamburger-icon');
    const closeIcon = document.querySelector('.close-icon');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            const isOpen = mainNav.classList.toggle('is-open');
            document.body.classList.toggle('body-no-scroll', isOpen);
            if (isOpen) {
                hamburgerIcon.style.display = 'none';
                closeIcon.style.display = 'block';
            } else {
                hamburgerIcon.style.display = 'block';
                closeIcon.style.display = 'none';
            }
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('is-open')) {
                    mainNav.classList.remove('is-open');
                    document.body.classList.remove('body-no-scroll');
                    hamburgerIcon.style.display = 'block';
                    closeIcon.style.display = 'none';
                }
            });
        });
    }

    // --- 2. THREE.JS & GSAP SCENE SETUP ---
    if (typeof THREE === 'undefined' || typeof gsap === 'undefined') { return; }
    gsap.registerPlugin(ScrollTrigger);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const canvas = document.getElementById('bg-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;

    // --- 3. ROCKET LAUNCH ANIMATION ASSETS & LOGIC ---
    const textureLoader = new THREE.TextureLoader();
    const rocketTexture = textureLoader.load('assets/rocket.png');
    const earthTexture = textureLoader.load('assets/earth.png');
    const moonTexture = textureLoader.load('assets/moon.png');
    [rocketTexture, earthTexture, moonTexture].forEach(t => { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; });
    
    function createSprite(texture, scale) {
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const geometry = new THREE.PlaneGeometry(1, 1);
        const sprite = new THREE.Mesh(geometry, material);
        sprite.scale.set(scale, scale, scale);
        return sprite;
    }
    const rocket = createSprite(rocketTexture, 1);
    const earth = createSprite(earthTexture, 5);
    const moon = createSprite(moonTexture, 4);
    earth.position.set(0, -5, 0);
    moon.position.set(0, 10, -5);
    rocket.position.set(0, -4, 1);
    scene.add(rocket, earth, moon);

    const starGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    const posArray = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) { posArray[i] = (Math.random() - 0.5) * 50; }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 0.02, color: 0xAAAAAA });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // <<< FIX: Reverted to the simplest scroll trigger >>>
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "main",
            start: "top top",
            end: "bottom bottom", // The new spacer div in the HTML makes this work
            scrub: 1,
        }
    });
    
    tl.to(rocket.position, { y: 11.5, z: -4 }, 0) 
      .to(rocket.rotation, { z: Math.PI * 0.25 }, 0)
      .to(camera.position, { z: 12 }, 0)
      .to(camera.position, { z: 4, y: 11 }, 0.8)
      .to(stars.position, { y: -5 }, 0);
    
    function animate() { renderer.render(scene, camera); requestAnimationFrame(animate); }
    animate();
    window.addEventListener('resize', () => { 
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // --- 4. GSAP-POWERED MICRO-INTERACTIONS & CONTENT ANIMATIONS ---
    gsap.utils.toArray('.project-card').forEach(card => {
        const content = card.querySelectorAll("h3, p, div");
        gsap.to(content, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none none" } });
    });
    gsap.utils.toArray('.skill-category').forEach(card => {
        const title = card.querySelector('h4');
        const tl = gsap.timeline({ paused: true });
        tl.to(card, { y: -5, scale: 1.02, duration: 0.3, ease: "power1.inOut" }).to(title, { color: "var(--accent-color)", duration: 0.3 }, 0);
        card.addEventListener('mouseenter', () => tl.play());
        card.addEventListener('mouseleave', () => tl.reverse());
    });
    gsap.utils.toArray('.animate-on-scroll').forEach(elem => {
        gsap.to(elem, { opacity: 1, y: 0, duration: 0.6, scrollTrigger: { trigger: elem, start: "top 90%", toggleActions: "play none none none" } });
    });

    // --- 5. OTHER UTILITIES (HEADER, NAV, CURSOR, FOOTER) ---
    const cursor = document.querySelector('.cursor');
    if (cursor) {
        window.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        document.querySelectorAll('a, button').forEach(el => {
            el.addEventListener('mouseover', () => cursor.classList.add('grow'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
        });
    }
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => { if (header) { header.classList.toggle('scrolled', window.scrollY > 50); } });
    const sections = document.querySelectorAll('section[data-section], footer[data-section]');
    const allNavLinks = document.querySelectorAll('.nav-link');
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('data-section');
                allNavLinks.forEach(link => { link.classList.toggle('active', link.getAttribute('data-nav') === sectionId); });
            }
        });
    }, { rootMargin: '-50% 0px -50% 0px' });
    sections.forEach(section => navObserver.observe(section));
    
    const copyBtn = document.getElementById('copy-email-btn');
    const emailText = document.getElementById('email-text');
    if(copyBtn && emailText) {
        copyBtn.addEventListener('click', () => {
            const email = emailText.textContent;
            navigator.clipboard.writeText(email).then(() => {
                copyBtn.innerHTML = 'Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                }, 2000);
            });
        });
    }
});