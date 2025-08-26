import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';

let scene, camera, renderer, controls, gui;
let texturedObjects = [];
let textures = {};
let textureSettings = {
    colorMap: true,
    normalMap: true,
    roughnessMap: true,
    wrapping: THREE.RepeatWrapping,
    filtering: THREE.LinearFilter
};

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2a2a);
    
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 5, 15);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    setupLights();
    createTextures();
    createTexturedObjects();
    setupGUI();
    
    window.addEventListener('resize', onWindowResize);
}

function setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xff6b6b, 0.5, 20);
    pointLight.position.set(-8, 5, 0);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0x4ecdc4, 0.5, 20);
    pointLight2.position.set(8, 5, 0);
    scene.add(pointLight2);
}

function createProceduralTexture(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    switch(type) {
        case 'checker':
            const checkSize = 32;
            for (let i = 0; i < canvas.width; i += checkSize) {
                for (let j = 0; j < canvas.height; j += checkSize) {
                    context.fillStyle = ((i + j) / checkSize) % 2 === 0 ? '#ffffff' : '#000000';
                    context.fillRect(i, j, checkSize, checkSize);
                }
            }
            break;
            
        case 'gradient':
            const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(0.5, '#45b7d1');
            gradient.addColorStop(1, '#ff6b6b');
            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);
            break;
            
        case 'noise':
            const imageData = context.createImageData(canvas.width, canvas.height);
            for (let i = 0; i < imageData.data.length; i += 4) {
                const value = Math.random() * 255;
                imageData.data[i] = value;
                imageData.data[i + 1] = value;
                imageData.data[i + 2] = value;
                imageData.data[i + 3] = 255;
            }
            context.putImageData(imageData, 0, 0);
            break;
            
        case 'brick':
            context.fillStyle = '#8B4513';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.strokeStyle = '#D2691E';
            context.lineWidth = 4;
            
            const brickHeight = 32;
            const brickWidth = 64;
            for (let y = 0; y < canvas.height; y += brickHeight) {
                const offset = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
                for (let x = -brickWidth; x < canvas.width + brickWidth; x += brickWidth) {
                    context.strokeRect(x + offset, y, brickWidth, brickHeight);
                }
            }
            break;
            
        case 'normal':
            context.fillStyle = '#8080ff';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < 100; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const radius = Math.random() * 20 + 5;
                const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, '#9999ff');
                gradient.addColorStop(1, '#8080ff');
                context.fillStyle = gradient;
                context.beginPath();
                context.arc(x, y, radius, 0, Math.PI * 2);
                context.fill();
            }
            break;
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = textureSettings.wrapping;
    texture.wrapT = textureSettings.wrapping;
    texture.magFilter = textureSettings.filtering;
    texture.minFilter = textureSettings.filtering;
    
    return texture;
}

function createTextures() {
    textures.checker = createProceduralTexture('checker');
    textures.gradient = createProceduralTexture('gradient');
    textures.noise = createProceduralTexture('noise');
    textures.brick = createProceduralTexture('brick');
    textures.normal = createProceduralTexture('normal');
    
    textures.checker.repeat.set(4, 4);
    textures.brick.repeat.set(2, 2);
    textures.normal.repeat.set(2, 2);
}

function createTexturedObjects() {
    const boxGeometry = new THREE.BoxGeometry(3, 3, 3, 64, 64);
    const boxMaterial = new THREE.MeshStandardMaterial({
        map: textures.brick,
        normalMap: textures.normal,
        normalScale: new THREE.Vector2(1, 1),
        roughness: 0.8,
        metalness: 0.2
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(-6, 2, 0);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);
    texturedObjects.push(box);
    
    const sphereGeometry = new THREE.SphereGeometry(2, 64, 64);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        map: textures.gradient,
        normalMap: textures.normal,
        normalScale: new THREE.Vector2(0.5, 0.5),
        roughness: 0.3,
        metalness: 0.7
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 2, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);
    texturedObjects.push(sphere);
    
    const torusGeometry = new THREE.TorusKnotGeometry(1.5, 0.5, 128, 32);
    const torusMaterial = new THREE.MeshStandardMaterial({
        map: textures.checker,
        roughness: 0.5,
        metalness: 0.5
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(6, 2, 0);
    torus.castShadow = true;
    torus.receiveShadow = true;
    scene.add(torus);
    texturedObjects.push(torus);
    
    const planeGeometry = new THREE.PlaneGeometry(30, 30, 100, 100);
    const planeMaterial = new THREE.MeshStandardMaterial({
        map: textures.checker,
        normalMap: textures.normal,
        normalScale: new THREE.Vector2(0.3, 0.3),
        roughness: 0.7,
        metalness: 0.1,
        side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2;
    plane.receiveShadow = true;
    scene.add(plane);
    
    const cylinderGeometry = new THREE.CylinderGeometry(1.5, 1.5, 3, 64);
    const cylinderMaterial = new THREE.MeshStandardMaterial({
        map: textures.noise,
        roughnessMap: textures.noise,
        metalnessMap: textures.gradient,
        normalMap: textures.normal,
        normalScale: new THREE.Vector2(2, 2)
    });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(0, 2, -6);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    scene.add(cylinder);
    texturedObjects.push(cylinder);
    
    const displacementGeometry = new THREE.SphereGeometry(2, 128, 128);
    const displacementMaterial = new THREE.MeshStandardMaterial({
        map: textures.gradient,
        displacementMap: textures.noise,
        displacementScale: 0.5,
        normalMap: textures.normal,
        roughness: 0.4,
        metalness: 0.6
    });
    const displacedSphere = new THREE.Mesh(displacementGeometry, displacementMaterial);
    displacedSphere.position.set(0, 2, 6);
    displacedSphere.castShadow = true;
    displacedSphere.receiveShadow = true;
    scene.add(displacedSphere);
    texturedObjects.push(displacedSphere);
}

function setupGUI() {
    gui = new dat.GUI();
    
    const textureFolder = gui.addFolder('Texture Settings');
    
    const params = {
        repeatX: 4,
        repeatY: 4,
        normalIntensity: 1,
        displacementScale: 0.5,
        roughness: 0.5,
        metalness: 0.5
    };
    
    textureFolder.add(params, 'repeatX', 1, 10).onChange(value => {
        Object.values(textures).forEach(texture => {
            texture.repeat.x = value;
        });
    });
    
    textureFolder.add(params, 'repeatY', 1, 10).onChange(value => {
        Object.values(textures).forEach(texture => {
            texture.repeat.y = value;
        });
    });
    
    textureFolder.add(params, 'normalIntensity', 0, 3).onChange(value => {
        texturedObjects.forEach(obj => {
            if (obj.material.normalScale) {
                obj.material.normalScale.set(value, value);
            }
        });
    });
    
    textureFolder.add(params, 'displacementScale', 0, 2).onChange(value => {
        texturedObjects.forEach(obj => {
            if (obj.material.displacementScale !== undefined) {
                obj.material.displacementScale = value;
            }
        });
    });
    
    textureFolder.open();
    
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '10px';
    gui.domElement.style.right = '110px';
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    texturedObjects.forEach((obj, index) => {
        if (obj.geometry.type === 'TorusKnotGeometry') {
            obj.rotation.x = time * 0.3;
            obj.rotation.y = time * 0.5;
        } else if (obj.geometry.type === 'BoxGeometry') {
            obj.rotation.y = time * 0.5;
        } else if (obj.geometry.type === 'SphereGeometry') {
            obj.rotation.y = time * 0.3;
        } else if (obj.geometry.type === 'CylinderGeometry') {
            obj.rotation.y = time * 0.4;
            obj.position.y = 2 + Math.sin(time * 2) * 0.5;
        }
    });
    
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.toggleTexture = function(type) {
    texturedObjects.forEach(obj => {
        switch(type) {
            case 'color':
                obj.material.map = obj.material.map ? null : textures.gradient;
                break;
            case 'normal':
                obj.material.normalMap = obj.material.normalMap ? null : textures.normal;
                break;
            case 'roughness':
                obj.material.roughnessMap = obj.material.roughnessMap ? null : textures.noise;
                break;
        }
        obj.material.needsUpdate = true;
    });
};

window.changeWrapping = function() {
    const modes = [THREE.RepeatWrapping, THREE.ClampToEdgeWrapping, THREE.MirroredRepeatWrapping];
    const currentIndex = modes.indexOf(textureSettings.wrapping);
    textureSettings.wrapping = modes[(currentIndex + 1) % modes.length];
    
    Object.values(textures).forEach(texture => {
        texture.wrapS = textureSettings.wrapping;
        texture.wrapT = textureSettings.wrapping;
        texture.needsUpdate = true;
    });
};

window.changeFiltering = function() {
    const modes = [THREE.LinearFilter, THREE.NearestFilter];
    const currentIndex = modes.indexOf(textureSettings.filtering);
    textureSettings.filtering = modes[(currentIndex + 1) % modes.length];
    
    Object.values(textures).forEach(texture => {
        texture.magFilter = textureSettings.filtering;
        texture.minFilter = textureSettings.filtering;
        texture.needsUpdate = true;
    });
};

init();
animate();