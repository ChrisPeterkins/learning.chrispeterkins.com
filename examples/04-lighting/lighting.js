import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
import * as dat from 'dat.gui';

let scene, camera, renderer, controls, gui;
let lights = {};
let helpers = {};

function init() {
    RectAreaLightUniformsLib.init();
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(10, 10, 10);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);
    
    createLights();
    createScene();
    setupGUI();
    setupLightControls();
    
    window.addEventListener('resize', onWindowResize);
}

function createLights() {
    lights.ambient = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(lights.ambient);
    
    lights.directional = new THREE.DirectionalLight(0xffff00, 1);
    lights.directional.position.set(5, 10, 5);
    lights.directional.castShadow = true;
    lights.directional.shadow.camera.near = 0.1;
    lights.directional.shadow.camera.far = 50;
    lights.directional.shadow.camera.left = -10;
    lights.directional.shadow.camera.right = 10;
    lights.directional.shadow.camera.top = 10;
    lights.directional.shadow.camera.bottom = -10;
    lights.directional.shadow.mapSize.width = 2048;
    lights.directional.shadow.mapSize.height = 2048;
    scene.add(lights.directional);
    
    helpers.directional = new THREE.DirectionalLightHelper(lights.directional, 2);
    scene.add(helpers.directional);
    
    lights.point1 = new THREE.PointLight(0xff0000, 1, 10);
    lights.point1.position.set(-5, 3, 0);
    lights.point1.castShadow = true;
    scene.add(lights.point1);
    
    helpers.point1 = new THREE.PointLightHelper(lights.point1, 0.5);
    scene.add(helpers.point1);
    
    lights.point2 = new THREE.PointLight(0x0000ff, 1, 10);
    lights.point2.position.set(5, 3, 0);
    lights.point2.castShadow = true;
    scene.add(lights.point2);
    
    helpers.point2 = new THREE.PointLightHelper(lights.point2, 0.5);
    scene.add(helpers.point2);
    
    lights.spot = new THREE.SpotLight(0x00ff00, 1);
    lights.spot.position.set(0, 8, 0);
    lights.spot.angle = Math.PI / 4;
    lights.spot.penumbra = 0.1;
    lights.spot.decay = 2;
    lights.spot.distance = 30;
    lights.spot.castShadow = true;
    lights.spot.shadow.mapSize.width = 1024;
    lights.spot.shadow.mapSize.height = 1024;
    lights.spot.shadow.camera.near = 0.5;
    lights.spot.shadow.camera.far = 20;
    scene.add(lights.spot);
    scene.add(lights.spot.target);
    
    helpers.spot = new THREE.SpotLightHelper(lights.spot);
    scene.add(helpers.spot);
    
    lights.hemisphere = new THREE.HemisphereLight(0x87ceeb, 0x8b4513, 0.3);
    lights.hemisphere.position.set(0, 10, 0);
    scene.add(lights.hemisphere);
    
    helpers.hemisphere = new THREE.HemisphereLightHelper(lights.hemisphere, 2);
    scene.add(helpers.hemisphere);
    
    lights.rectArea = new THREE.RectAreaLight(0xffffff, 5, 4, 4);
    lights.rectArea.position.set(0, 5, -8);
    lights.rectArea.lookAt(0, 0, 0);
    scene.add(lights.rectArea);
    
    helpers.rectArea = new RectAreaLightHelper(lights.rectArea);
    scene.add(helpers.rectArea);
}

function createScene() {
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x222222,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    const wallGeometry = new THREE.PlaneGeometry(30, 15);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        roughness: 0.9
    });
    
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.z = -10;
    backWall.position.y = 5;
    backWall.receiveShadow = true;
    scene.add(backWall);
    
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.7
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 0, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);
    
    const cubeGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const cubeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00a550,
        roughness: 0.5,
        metalness: 0.5
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(-4, -0.25, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
    
    const torusGeometry = new THREE.TorusKnotGeometry(0.8, 0.3, 100, 16);
    const torusMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff6b6b,
        roughness: 0.2,
        metalness: 0.8
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(4, 0, 0);
    torus.castShadow = true;
    torus.receiveShadow = true;
    scene.add(torus);
    
    for (let i = 0; i < 5; i++) {
        const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 32);
        const pillarMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x666666,
            roughness: 0.7,
            metalness: 0.3
        });
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(
            Math.cos(i * Math.PI * 0.4) * 8,
            2,
            Math.sin(i * Math.PI * 0.4) * 8
        );
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        scene.add(pillar);
    }
}

function setupGUI() {
    gui = new dat.GUI();
    
    const lightingFolder = gui.addFolder('Light Properties');
    
    const directionalFolder = lightingFolder.addFolder('Directional Light');
    directionalFolder.add(lights.directional, 'intensity', 0, 3);
    directionalFolder.addColor({ color: 0xffff00 }, 'color').onChange(value => {
        lights.directional.color.set(value);
    });
    
    const spotFolder = lightingFolder.addFolder('Spot Light');
    spotFolder.add(lights.spot, 'intensity', 0, 3);
    spotFolder.add(lights.spot, 'angle', 0, Math.PI / 2);
    spotFolder.add(lights.spot, 'penumbra', 0, 1);
    spotFolder.add(lights.spot.position, 'x', -10, 10);
    spotFolder.add(lights.spot.position, 'z', -10, 10);
    
    lightingFolder.open();
    
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '10px';
    gui.domElement.style.right = '110px';
}

function setupLightControls() {
    document.getElementById('ambient').addEventListener('change', (e) => {
        lights.ambient.visible = e.target.checked;
    });
    
    document.getElementById('directional').addEventListener('change', (e) => {
        lights.directional.visible = e.target.checked;
        helpers.directional.visible = e.target.checked;
    });
    
    document.getElementById('point1').addEventListener('change', (e) => {
        lights.point1.visible = e.target.checked;
        helpers.point1.visible = e.target.checked;
    });
    
    document.getElementById('point2').addEventListener('change', (e) => {
        lights.point2.visible = e.target.checked;
        helpers.point2.visible = e.target.checked;
    });
    
    document.getElementById('spot').addEventListener('change', (e) => {
        lights.spot.visible = e.target.checked;
        helpers.spot.visible = e.target.checked;
    });
    
    document.getElementById('hemisphere').addEventListener('change', (e) => {
        lights.hemisphere.visible = e.target.checked;
        helpers.hemisphere.visible = e.target.checked;
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    lights.point1.position.x = Math.sin(time) * 6;
    lights.point1.position.z = Math.cos(time) * 6;
    
    lights.point2.position.x = Math.sin(time + Math.PI) * 6;
    lights.point2.position.z = Math.cos(time + Math.PI) * 6;
    
    lights.spot.target.position.x = Math.sin(time * 0.5) * 4;
    lights.spot.target.position.z = Math.cos(time * 0.5) * 4;
    
    helpers.spot.update();
    
    scene.traverse((child) => {
        if (child.isMesh && child.geometry.type === 'SphereGeometry') {
            child.rotation.y = time;
        }
        if (child.isMesh && child.geometry.type === 'BoxGeometry') {
            child.rotation.x = time * 0.5;
            child.rotation.y = time * 0.5;
        }
        if (child.isMesh && child.geometry.type === 'TorusKnotGeometry') {
            child.rotation.x = time * 0.3;
            child.rotation.y = time * 0.3;
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

init();
animate();