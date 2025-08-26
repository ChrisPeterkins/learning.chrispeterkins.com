import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';

let scene, camera, renderer, controls, gui;
let meshes = [];
let currentMaterialType = 'standard';
let wireframeEnabled = false;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2a2a);
    
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 5, 10);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    setupLights();
    createMaterialShowcase();
    setupGUI();
    
    window.addEventListener('resize', onWindowResize);
}

function setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xff6b6b, 1, 10);
    pointLight.position.set(-5, 3, 0);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0x4ecdc4, 1, 10);
    pointLight2.position.set(5, 3, 0);
    scene.add(pointLight2);
    
    const spotLight = new THREE.SpotLight(0xffd93d, 1);
    spotLight.position.set(0, 10, 0);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.2;
    spotLight.castShadow = true;
    scene.add(spotLight);
}

function createMaterial(type) {
    const color = 0x00a550;
    
    switch(type) {
        case 'basic':
            return new THREE.MeshBasicMaterial({ 
                color,
                wireframe: wireframeEnabled
            });
        
        case 'lambert':
            return new THREE.MeshLambertMaterial({ 
                color,
                emissive: 0x111111,
                wireframe: wireframeEnabled
            });
        
        case 'phong':
            return new THREE.MeshPhongMaterial({ 
                color,
                shininess: 100,
                specular: 0x222222,
                wireframe: wireframeEnabled
            });
        
        case 'standard':
            return new THREE.MeshStandardMaterial({ 
                color,
                roughness: 0.5,
                metalness: 0.5,
                wireframe: wireframeEnabled
            });
        
        case 'physical':
            return new THREE.MeshPhysicalMaterial({ 
                color,
                roughness: 0.2,
                metalness: 0.8,
                clearcoat: 1,
                clearcoatRoughness: 0.1,
                wireframe: wireframeEnabled
            });
        
        case 'toon':
            return new THREE.MeshToonMaterial({ 
                color,
                wireframe: wireframeEnabled
            });
        
        default:
            return new THREE.MeshStandardMaterial({ 
                color,
                wireframe: wireframeEnabled
            });
    }
}

function createMaterialShowcase() {
    const geometries = [
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.BoxGeometry(1.5, 1.5, 1.5),
        new THREE.TorusKnotGeometry(0.8, 0.3, 100, 16),
        new THREE.ConeGeometry(1, 2, 32),
        new THREE.TorusGeometry(1, 0.4, 16, 100),
        new THREE.IcosahedronGeometry(1)
    ];
    
    geometries.forEach((geometry, index) => {
        const material = createMaterial(currentMaterialType);
        const mesh = new THREE.Mesh(geometry, material);
        
        const row = Math.floor(index / 3);
        const col = index % 3;
        mesh.position.x = (col - 1) * 4;
        mesh.position.z = (row - 0.5) * 4;
        mesh.position.y = 1;
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        scene.add(mesh);
        meshes.push(mesh);
    });
    
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);
}

function updateAllMaterials(type) {
    currentMaterialType = type;
    meshes.forEach(mesh => {
        const oldMaterial = mesh.material;
        mesh.material = createMaterial(type);
        oldMaterial.dispose();
    });
    
    document.querySelectorAll('.controls button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function setupGUI() {
    gui = new dat.GUI();
    
    const materialFolder = gui.addFolder('Material Properties');
    
    const params = {
        color: 0x00a550,
        emissive: 0x000000,
        roughness: 0.5,
        metalness: 0.5,
        envMapIntensity: 1
    };
    
    materialFolder.addColor(params, 'color').onChange(value => {
        meshes.forEach(mesh => {
            if (mesh.material.color) {
                mesh.material.color.set(value);
            }
        });
    });
    
    materialFolder.add(params, 'roughness', 0, 1).onChange(value => {
        meshes.forEach(mesh => {
            if (mesh.material.roughness !== undefined) {
                mesh.material.roughness = value;
            }
        });
    });
    
    materialFolder.add(params, 'metalness', 0, 1).onChange(value => {
        meshes.forEach(mesh => {
            if (mesh.material.metalness !== undefined) {
                mesh.material.metalness = value;
            }
        });
    });
    
    materialFolder.open();
    
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '10px';
    gui.domElement.style.right = '110px';
}

function animate() {
    requestAnimationFrame(animate);
    
    meshes.forEach((mesh, index) => {
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.01;
        
        mesh.position.y = 1 + Math.sin(Date.now() * 0.001 + index) * 0.2;
    });
    
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.switchMaterial = function(type) {
    updateAllMaterials(type);
};

window.toggleWireframe = function() {
    wireframeEnabled = !wireframeEnabled;
    meshes.forEach(mesh => {
        mesh.material.wireframe = wireframeEnabled;
    });
};

init();
animate();