// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================
const CONFIG = {
    // Your backend API endpoint
    BACKEND_URL: 'https://your-backend-api.com/api',
    
    // API endpoints
    ENDPOINTS: {
        contact: '/contact',
        subscribe: '/subscribe',
        analytics: '/analytics'
    },
    
    // Enable/disable features
    FEATURES: {
        analytics: true,
        contactForm: true,
        animations: true
    }
};

// ============================================
// 3D BACKGROUND ANIMATION (Three.js)
// ============================================
let scene, camera, renderer, sphere, particles;

function init3DBackground() {
    const canvas = document.getElementById('backgroundCanvas');
    
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create animated sphere
    const geometry = new THREE.IcosahedronGeometry(2, 4);
    const material = new THREE.MeshPhongMaterial({
        color: 0x667eea,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    
    // Add particles
    createParticles();
    
    // Lighting
    const light1 = new THREE.PointLight(0x667eea, 1, 100);
    light1.position.set(10, 10, 10);
    scene.add(light1);
    
    const light2 = new THREE.PointLight(0xf093fb, 1, 100);
    light2.position.set(-10, -10, -10);
    scene.add(light2);
    
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    animate3D();
}

function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const positions = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 20;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x667eea,
        size: 0.02,
        transparent: true,
        opacity: 0.6
    });
    
    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
}

function animate3D() {
    requestAnimationFrame(animate3D);
    
    // Rotate sphere
    sphere.rotation.x += 0.001;
    sphere.rotation.y += 0.002;
    
    // Animate particles
    particles.rotation.y += 0.0005;
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// NAVIGATION
// ============================================
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Scroll effect for navbar
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu on link click
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ============================================
// SCROLL ANIMATIONS
// ============================================
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all project cards
document.querySelectorAll('.project-card').forEach(card => {
    observer.observe(card);
});

// ============================================
// COUNTER ANIMATION FOR STATS
// ============================================
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Observe stats section
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = document.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-count'));
                animateCounter(stat, target);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const aboutSection = document.querySelector('.about');
if (aboutSection) {
    statsObserver.observe(aboutSection);
}

// ============================================
// CONTACT FORM WITH BACKEND INTEGRATION
// ============================================
const contactForm = document.getElementById('contactForm');
const formMessage = document.querySelector('.form-message');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = contactForm.querySelector('button[type="submit"]');
    submitButton.classList.add('loading');
    submitButton.disabled = true;
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value,
        timestamp: new Date().toISOString()
    };
    
    try {
        // Send to backend
        const response = await sendToBackend(CONFIG.ENDPOINTS.contact, formData);
        
        if (response.success) {
            showMessage('success', 'Thank you! Your message has been sent successfully.');
            contactForm.reset();
            
            // Track analytics if enabled
            if (CONFIG.FEATURES.analytics) {
                trackEvent('form_submission', { type: 'contact' });
            }
        } else {
            throw new Error(response.message || 'Failed to send message');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage('error', 'Oops! Something went wrong. Please try again or contact me directly.');
    } finally {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
});

function showMessage(type, text) {
    formMessage.className = `form-message ${type}`;
    formMessage.textContent = text;
    
    setTimeout(() => {
        formMessage.className = 'form-message';
    }, 5000);
}

// ============================================
// BACKEND API FUNCTIONS
// ============================================

/**
 * Send data to backend API
 * @param {string} endpoint - API endpoint path
 * @param {object} data - Data to send
 * @returns {Promise} Response from backend
 */
async function sendToBackend(endpoint, data) {
    try {
        const response = await fetch(`${CONFIG.BACKEND_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Backend request failed:', error);
        throw error;
    }
}

/**
 * Get data from backend API
 * @param {string} endpoint - API endpoint path
 * @returns {Promise} Response from backend
 */
async function fetchFromBackend(endpoint) {
    try {
        const response = await fetch(`${CONFIG.BACKEND_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Backend fetch failed:', error);
        throw error;
    }
}

// ============================================
// ANALYTICS TRACKING
// ============================================

/**
 * Track user events and send to backend
 * @param {string} eventName - Name of the event
 * @param {object} eventData - Additional event data
 */
async function trackEvent(eventName, eventData = {}) {
    if (!CONFIG.FEATURES.analytics) return;
    
    const analyticsData = {
        event: eventName,
        data: eventData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        referrer: document.referrer
    };
    
    try {
        await sendToBackend(CONFIG.ENDPOINTS.analytics, analyticsData);
    } catch (error) {
        console.error('Analytics tracking failed:', error);
    }
}

// Track page view on load
window.addEventListener('load', () => {
    trackEvent('page_view', { page: window.location.pathname });
});

// Track project clicks
document.querySelectorAll('.project-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const projectTitle = e.target.closest('.project-card').querySelector('.project-title').textContent;
        trackEvent('project_click', { project: projectTitle });
    });
});

// Track scroll depth
let maxScrollDepth = 0;
window.addEventListener('scroll', () => {
    const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    if (scrollPercentage > maxScrollDepth) {
        maxScrollDepth = Math.floor(scrollPercentage / 25) * 25; // Track in 25% increments
        if (maxScrollDepth > 0) {
            trackEvent('scroll_depth', { depth: `${maxScrollDepth}%` });
        }
    }
});

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// CURSOR EFFECT (Optional Enhancement)
// ============================================
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    const speed = 0.2;
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;
    
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    
    requestAnimationFrame(animateCursor);
}

// Add cursor styles dynamically
const cursorStyle = document.createElement('style');
cursorStyle.textContent = `
    .custom-cursor {
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid #667eea;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.2s ease;
        mix-blend-mode: difference;
    }
    
    a:hover ~ .custom-cursor,
    button:hover ~ .custom-cursor {
        transform: scale(1.5);
        background: rgba(102, 126, 234, 0.3);
    }
`;
document.head.appendChild(cursorStyle);

animateCursor();

// ============================================
// EXAMPLE: LOAD PROJECTS FROM BACKEND
// ============================================

/**
 * Example function to load projects dynamically from backend
 * Uncomment and customize as needed
 */
async function loadProjects() {
    try {
        const projects = await fetchFromBackend('/projects');
        const projectsContainer = document.querySelector('.projects .container');
        
        // Clear existing projects except title
        const title = projectsContainer.querySelector('.section-title');
        projectsContainer.innerHTML = '';
        projectsContainer.appendChild(title);
        
        // Add projects from backend
        projects.forEach((project, index) => {
            const projectCard = createProjectCard(project, index);
            projectsContainer.appendChild(projectCard);
        });
        
    } catch (error) {
        console.error('Failed to load projects:', error);
    }
}

function createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = `project-card ${index % 2 === 1 ? 'reverse' : ''}`;
    card.setAttribute('data-project', index + 1);
    
    card.innerHTML = `
        <div class="project-image">
            <div class="image-placeholder" style="background: ${project.gradient};">
                ${project.image ? `<img src="${project.image}" alt="${project.title}">` : ''}
            </div>
        </div>
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-tags">
                ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
            </div>
            <a href="${project.link}" class="project-link">View Project →</a>
        </div>
    `;
    
    observer.observe(card);
    return card;
}

// ============================================
// INITIALIZE EVERYTHING
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize 3D background
    if (CONFIG.FEATURES.animations) {
        init3DBackground();
    }
    
    // Uncomment to load projects from backend
    // loadProjects();
    
    console.log('Portfolio initialized successfully!');
});