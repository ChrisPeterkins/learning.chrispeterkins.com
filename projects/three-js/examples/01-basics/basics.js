import * as THREE from 'three';

let scene, camera, renderer;
let currentMesh;
let isRotating = true;

function checkWebGL() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            throw new Error('WebGL not supported');
        }
        return true;
    } catch (e) {
        console.error('WebGL check failed:', e);
        const container = document.getElementById('canvas-container');
        container.innerHTML = `
            <div style="color: white; padding: 20px; text-align: center;">
                <h2>WebGL Not Supported</h2>
                <p>Your browser or device doesn't support WebGL.</p>
                <p>Try using a different browser or enabling hardware acceleration.</p>
            </div>
        `;
        return false;
    }
}

function init() {
    if (!checkWebGL()) return;
    
    try {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a1a);
        
        camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 5;
        
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        const container = document.getElementById('canvas-container');
        if (!container) {
            throw new Error('Canvas container not found');
        }
        container.appendChild(renderer.domElement);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);
        
        createMesh('cube');
        
        const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
        gridHelper.position.y = -2;
        scene.add(gridHelper);
        
        const axesHelper = new THREE.AxesHelper(3);
        scene.add(axesHelper);
        
        window.addEventListener('resize', onWindowResize, false);
        
        // Add touch controls for mobile
        addTouchControls();
        
        console.log('Three.js scene initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Three.js:', error);
        const container = document.getElementById('canvas-container');
        if (container) {
            container.innerHTML = `
                <div style="color: white; padding: 20px; text-align: center;">
                    <h2>Error Initializing 3D Scene</h2>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

function addTouchControls() {
    if (!renderer || !renderer.domElement) return;
    
    let touchStartX = 0;
    let touchStartY = 0;
    
    renderer.domElement.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isRotating = false;
        }
    }, { passive: true });
    
    renderer.domElement.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && currentMesh) {
            const deltaX = e.touches[0].clientX - touchStartX;
            const deltaY = e.touches[0].clientY - touchStartY;
            
            currentMesh.rotation.y += deltaX * 0.01;
            currentMesh.rotation.x += deltaY * 0.01;
            
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
    }, { passive: true });
    
    renderer.domElement.addEventListener('touchend', () => {
        isRotating = true;
    }, { passive: true });
}

function createMesh(type) {
    if (currentMesh) {
        scene.remove(currentMesh);
        currentMesh.geometry.dispose();
        currentMesh.material.dispose();
    }
    
    let geometry;
    
    switch(type) {
        case 'cube':
            geometry = new THREE.BoxGeometry(2, 2, 2);
            break;
        case 'sphere':
            geometry = new THREE.SphereGeometry(1.5, 32, 32);
            break;
        case 'cone':
            geometry = new THREE.ConeGeometry(1.5, 3, 32);
            break;
        case 'torus':
            geometry = new THREE.TorusGeometry(1.5, 0.5, 16, 100);
            break;
        default:
            geometry = new THREE.BoxGeometry(2, 2, 2);
    }
    
    const material = new THREE.MeshPhongMaterial({
        color: 0x667eea,
        wireframe: false,
        flatShading: false
    });
    
    currentMesh = new THREE.Mesh(geometry, material);
    scene.add(currentMesh);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (currentMesh && isRotating) {
        currentMesh.rotation.x += 0.01;
        currentMesh.rotation.y += 0.01;
    }
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
}

window.changeShape = function(shape) {
    createMesh(shape);
};

window.toggleRotation = function() {
    isRotating = !isRotating;
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        init();
        animate();
    });
} else {
    init();
    animate();
}