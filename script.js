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

// Store exhaust trails
let exhaustTrails = [];

function createAirplane(scale = 1) {
    const airplane = new THREE.Group();
    
    // Fuselage (main body)
    const fuselageGeometry = new THREE.CylinderGeometry(0.15 * scale, 0.2 * scale, 1.2 * scale, 8);
    const fuselageMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xcccccc,
        shininess: 30
    });
    const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
    fuselage.rotation.z = Math.PI / 2;
    airplane.add(fuselage);
    
    // Wings
    const wingGeometry = new THREE.BoxGeometry(2 * scale, 0.05 * scale, 0.5 * scale);
    const wingMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xaaaaaa,
        shininess: 20
    });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.y = -0.05 * scale;
    airplane.add(wings);
    
    // Tail wing
    const tailGeometry = new THREE.BoxGeometry(0.6 * scale, 0.05 * scale, 0.4 * scale);
    const tail = new THREE.Mesh(tailGeometry, wingMaterial);
    tail.position.set(-0.5 * scale, -0.05 * scale, 0);
    airplane.add(tail);
    
    // Vertical stabilizer
    const vStabGeometry = new THREE.BoxGeometry(0.05 * scale, 0.4 * scale, 0.3 * scale);
    const vStab = new THREE.Mesh(vStabGeometry, wingMaterial);
    vStab.position.set(-0.5 * scale, 0.15 * scale, 0);
    airplane.add(vStab);
    
    return airplane;
}

function createExhaustTrail(position, color) {
    const trail = {
        particles: [],
        maxParticles: 20,
        position: position.clone()
    };
    
    for (let i = 0; i < trail.maxParticles; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.visible = false;
        scene.add(particle);
        trail.particles.push(particle);
    }
    
    return trail;
}

function createFloatingGeometries() {
    // Create airplanes
    const airplaneCount = 8;
    for (let i = 0; i < airplaneCount; i++) {
        const airplane = createAirplane(0.8);
        
        // Random color scheme
        const hue = Math.random();
        airplane.children.forEach(child => {
            if (child.material) {
                child.material.color.setHSL(hue, 0.5, 0.6);
            }
        });
        
        airplane.position.set(
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60
        );
        
        // Random orientation
        airplane.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        
        // Movement data
        airplane.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1
            ),
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            }
        };
        
        // Create exhaust trail
        const exhaustColor = new THREE.Color().setHSL(0.1, 0.3, 0.5);
        airplane.userData.exhaustTrail = createExhaustTrail(airplane.position, exhaustColor);
        airplane.userData.exhaustIndex = 0;
        exhaustTrails.push(airplane.userData.exhaustTrail);

        geometries.push(airplane);
        scene.add(airplane);
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate particles
    if (particles) {
        particles.rotation.y += 0.0005;
        particles.rotation.x += 0.0003;
    }

    // Animate airplanes
    geometries.forEach(airplane => {
        // Move airplane
        airplane.position.add(airplane.userData.velocity);
        
        // Rotate airplane slightly
        airplane.rotation.x += airplane.userData.rotationSpeed.x;
        airplane.rotation.y += airplane.userData.rotationSpeed.y;
        airplane.rotation.z += airplane.userData.rotationSpeed.z;
        
        // Bounce off boundaries
        const boundary = 50;
        if (Math.abs(airplane.position.x) > boundary) {
            airplane.userData.velocity.x *= -1;
        }
        if (Math.abs(airplane.position.y) > boundary) {
            airplane.userData.velocity.y *= -1;
        }
        if (Math.abs(airplane.position.z) > boundary) {
            airplane.userData.velocity.z *= -1;
        }
        
        // Update exhaust trail
        if (airplane.userData.exhaustTrail) {
            const trail = airplane.userData.exhaustTrail;
            const currentIndex = airplane.userData.exhaustIndex;
            const particle = trail.particles[currentIndex];
            
            // Position particle behind the airplane
            const backOffset = new THREE.Vector3(-0.6, 0, 0);
            backOffset.applyQuaternion(airplane.quaternion);
            particle.position.copy(airplane.position).add(backOffset);
            
            particle.visible = true;
            particle.material.opacity = 0.6;
            particle.scale.set(1, 1, 1);
            
            // Update index for next frame
            airplane.userData.exhaustIndex = (currentIndex + 1) % trail.maxParticles;
        }
    });
    
    // Fade out exhaust particles
    exhaustTrails.forEach(trail => {
        trail.particles.forEach(particle => {
            if (particle.visible) {
                particle.material.opacity *= 0.96;
                particle.scale.multiplyScalar(1.02);
                if (particle.material.opacity < 0.01) {
                    particle.visible = false;
                }
            }
        });
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
