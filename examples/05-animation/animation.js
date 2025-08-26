import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let scene, camera, renderer, controls;
let objects = {};
let clock = new THREE.Clock();
let frameCount = 0;
let lastTime = performance.now();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
    
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 10, 20);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);
    
    setupLights();
    createAnimatedObjects();
    createEnvironment();
    
    window.addEventListener('resize', onWindowResize);
}

function setupLights() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x667eea, 1, 20);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);
}

function createAnimatedObjects() {
    const linearBox = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshPhongMaterial({ color: 0xff6b6b })
    );
    linearBox.castShadow = true;
    linearBox.position.set(-8, 1, 0);
    scene.add(linearBox);
    objects.linear = linearBox;
    
    const circularSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshPhongMaterial({ color: 0x4ecdc4 })
    );
    circularSphere.castShadow = true;
    scene.add(circularSphere);
    objects.circular = circularSphere;
    
    const sineCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1, 32),
        new THREE.MeshPhongMaterial({ color: 0x95e77e })
    );
    sineCone.castShadow = true;
    scene.add(sineCone);
    objects.sine = sineCone;
    
    const springTorus = new THREE.Mesh(
        new THREE.TorusGeometry(0.4, 0.2, 16, 100),
        new THREE.MeshPhongMaterial({ color: 0xfeca57 })
    );
    springTorus.castShadow = true;
    springTorus.position.set(5, 2, 0);
    scene.add(springTorus);
    objects.spring = { 
        mesh: springTorus, 
        velocity: 0, 
        targetY: 2,
        currentY: 2
    };
    
    const lerpCylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
        new THREE.MeshPhongMaterial({ color: 0xee5a6f })
    );
    lerpCylinder.castShadow = true;
    lerpCylinder.position.set(0, 1, 5);
    scene.add(lerpCylinder);
    objects.lerp = {
        mesh: lerpCylinder,
        target: new THREE.Vector3(0, 1, 5),
        nextTarget: new THREE.Vector3(0, 1, 5)
    };
    
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 30;
        positions[i + 1] = Math.random() * 10;
        positions[i + 2] = (Math.random() - 0.5) * 30;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x667eea,
        size: 0.05,
        transparent: true,
        opacity: 0.6
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    objects.particles = particles;
}

function createEnvironment() {
    const groundGeometry = new THREE.PlaneGeometry(40, 40);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1a1a1a,
        side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    const gridHelper = new THREE.GridHelper(40, 40, 0x444444, 0x222222);
    scene.add(gridHelper);
}

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = clock.getDelta();
    
    if (objects.linear) {
        objects.linear.position.x = -8 + Math.sin(elapsedTime) * 6;
    }
    
    if (objects.circular) {
        const radius = 4;
        objects.circular.position.x = Math.cos(elapsedTime * 1.5) * radius;
        objects.circular.position.z = Math.sin(elapsedTime * 1.5) * radius;
        objects.circular.position.y = 1;
    }
    
    if (objects.sine) {
        objects.sine.position.x = -4;
        objects.sine.position.y = 2 + Math.sin(elapsedTime * 2) * 2;
        objects.sine.position.z = Math.sin(elapsedTime) * 3;
        objects.sine.rotation.z = Math.sin(elapsedTime * 3) * 0.5;
    }
    
    if (objects.spring) {
        const springObj = objects.spring;
        const force = (springObj.targetY - springObj.currentY) * 0.1;
        const damping = springObj.velocity * 0.9;
        springObj.velocity += force;
        springObj.velocity *= damping;
        springObj.currentY += springObj.velocity;
        springObj.mesh.position.y = springObj.currentY;
        
        if (Math.random() < 0.01) {
            springObj.targetY = 1 + Math.random() * 4;
        }
    }
    
    if (objects.lerp) {
        const lerpObj = objects.lerp;
        
        if (Math.random() < 0.02) {
            lerpObj.nextTarget = new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                1 + Math.random() * 3,
                (Math.random() - 0.5) * 8
            );
        }
        
        lerpObj.target.lerp(lerpObj.nextTarget, 0.05);
        lerpObj.mesh.position.copy(lerpObj.target);
        
        lerpObj.mesh.rotation.y += 0.02;
        lerpObj.mesh.scale.x = 1 + Math.sin(elapsedTime * 5) * 0.1;
        lerpObj.mesh.scale.z = 1 + Math.cos(elapsedTime * 5) * 0.1;
    }
    
    if (objects.particles) {
        objects.particles.rotation.y += 0.001;
        const positions = objects.particles.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] += Math.sin(elapsedTime + i) * 0.01;
        }
        objects.particles.geometry.attributes.position.needsUpdate = true;
    }
    
    frameCount++;
    const currentTime = performance.now();
    if (currentTime >= lastTime + 1000) {
        document.getElementById('fps').textContent = frameCount;
        document.getElementById('delta').textContent = (deltaTime * 1000).toFixed(2);
        frameCount = 0;
        lastTime = currentTime;
    }
    
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