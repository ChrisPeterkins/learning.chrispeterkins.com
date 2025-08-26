import * as THREE from 'three';

let scene, camera, renderer;
let currentMesh;
let isRotating = true;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 5;
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
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
    
    window.addEventListener('resize', onWindowResize);
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
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.changeShape = function(shape) {
    createMesh(shape);
};

window.toggleRotation = function() {
    isRotating = !isRotating;
};

init();
animate();