import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ===== Scene Setup =====
let scene, camera, renderer, controls;
let particles, particleGeometry, particleMaterial;
let geometries = [];

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.001);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 30;

    // Renderer
    const canvas = document.getElementById('bg-canvas');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ff88, 2);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x0099ff, 2);
    pointLight2.position.set(-20, -20, -20);
    scene.add(pointLight2);

    // Particles
    createParticles();

    // Floating Geometries
    createFloatingGeometries();

    // Start animation
    animate();

    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 1500);
}

function createParticles() {
    particleGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 100;
        positions[i + 1] = (Math.random() - 0.5) * 100;
        positions[i + 2] = (Math.random() - 0.5) * 100;

        const color = new THREE.Color();
        color.setHSL(Math.random(), 0.8, 0.5);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
}

function createFloatingGeometries() {
    // Create planets (larger spheres with different textures)
    const planetCount = 4;
    for (let i = 0; i < planetCount; i++) {
        const planetSize = 1.5 + Math.random() * 1.5; // Random sizes between 1.5 and 3
        const geometry = new THREE.SphereGeometry(planetSize, 32, 32);
        
        // Different planet appearances
        const material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.6, 0.5),
            metalness: 0.3,
            roughness: 0.7,
            transparent: true,
            opacity: 0.8
        });

        const planet = new THREE.Mesh(geometry, material);
        planet.position.set(
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60
        );
        planet.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        planet.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.005,
                y: (Math.random() - 0.5) * 0.005,
                z: (Math.random() - 0.5) * 0.005
            }
        };

        geometries.push(planet);
        scene.add(planet);
    }

    // Create stars (small glowing spheres)
    const starCount = 4;
    for (let i = 0; i < starCount; i++) {
        const starSize = 0.3 + Math.random() * 0.5; // Small sizes
        const geometry = new THREE.SphereGeometry(starSize, 16, 16);
        
        const starColor = new THREE.Color().setHSL(Math.random() * 0.1 + 0.15, 1.0, 0.9);
        const material = new THREE.MeshBasicMaterial({
            color: starColor,
            transparent: true,
            opacity: 0.9
        });

        // Add a point light at star position for glow effect
        const starLight = new THREE.PointLight(starColor, 1, 20);
        const star = new THREE.Mesh(geometry, material);
        star.add(starLight);
        
        star.position.set(
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60
        );
        star.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.002,
                y: (Math.random() - 0.5) * 0.002,
                z: (Math.random() - 0.5) * 0.002
            }
        };

        geometries.push(star);
        scene.add(star);
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate particles
    if (particles) {
        particles.rotation.y += 0.0005;
        particles.rotation.x += 0.0003;
    }

    // Animate geometries
    geometries.forEach(mesh => {
        mesh.rotation.x += mesh.userData.rotationSpeed.x;
        mesh.rotation.y += mesh.userData.rotationSpeed.y;
        mesh.rotation.z += mesh.userData.rotationSpeed.z;
    });

    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== Navigation =====
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');
const navAnchors = document.querySelectorAll('.nav-links a');

if (burger) {
    burger.addEventListener('click', () => {
        nav.classList.toggle('active');
    });
}

navAnchors.forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
    });
});

// ===== Typewriter Effect =====
const texts = [
    'Software Developer',
    'Full Stack Engineer',
    'Problem Solver',
    'Tech Enthusiast'
];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typedTextElement = document.querySelector('.typed-text');

function typeWriter() {
    const currentText = texts[textIndex];
    
    if (isDeleting) {
        typedTextElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typedTextElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentText.length) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        typeSpeed = 500;
    }

    setTimeout(typeWriter, typeSpeed);
}

// ===== Smooth Scrolling =====
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

// ===== Counter Animation =====
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            // Animate counters
            const counters = entry.target.querySelectorAll('.stat-number');
            counters.forEach(counter => {
                if (!counter.classList.contains('animated')) {
                    animateCounter(counter);
                    counter.classList.add('animated');
                }
            });
        }
    });
}, observerOptions);

// Observe elements
document.querySelectorAll('[data-aos]').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s, transform 0.6s';
    observer.observe(el);
});

// ===== Project Canvas Animations =====
const projectCanvases = document.querySelectorAll('.project-canvas');

// Reusable geometries (created once)
const sharedGeometries = [
    new THREE.TorusGeometry(2, 0.7, 16, 100),
    new THREE.IcosahedronGeometry(2, 1),
    new THREE.BoxGeometry(3, 3, 3)
];

const projectMeshes = [];

projectCanvases.forEach((canvas, index) => {
    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;
    const aspectRatio = canvasWidth / canvasHeight;
    
    const miniScene = new THREE.Scene();
    const miniCamera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    const miniRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    miniRenderer.setSize(canvasWidth, canvasHeight);
    miniRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const material = new THREE.MeshNormalMaterial({ wireframe: false });
    const mesh = new THREE.Mesh(sharedGeometries[index % 3], material);
    miniScene.add(mesh);
    
    miniCamera.position.z = 5;
    
    projectMeshes.push({
        mesh,
        renderer: miniRenderer,
        scene: miniScene,
        camera: miniCamera
    });
});

// Single consolidated animation loop for all project canvases
function animateProjectCanvases() {
    requestAnimationFrame(animateProjectCanvases);
    
    projectMeshes.forEach(({ mesh, renderer, scene, camera }) => {
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
        renderer.render(scene, camera);
    });
}

if (projectMeshes.length > 0) {
    animateProjectCanvases();
}

// ===== Initialize =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        init();
        typeWriter();
    });
} else {
    init();
    typeWriter();
}
