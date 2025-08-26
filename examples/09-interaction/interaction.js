import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';

let scene, camera, renderer, controls;
let raycaster, mouse, selectedObject, hoveredObject;
let interactableObjects = [];
let score = 0;
let interactionMode = 'select';
let dragControls = null;

const tooltip = document.getElementById('tooltip');
const scoreElement = document.getElementById('score');

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2a2a);
    
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
    
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    setupLights();
    createInteractiveScene();
    setupEventListeners();
    
    window.addEventListener('resize', onWindowResize);
}

function setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    scene.add(directionalLight);
}

function createInteractiveScene() {
    const groundGeometry = new THREE.PlaneGeometry(40, 40);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    ground.userData.type = 'ground';
    scene.add(ground);
    
    const gridHelper = new THREE.GridHelper(40, 40, 0x444444, 0x222222);
    gridHelper.position.y = -1.99;
    scene.add(gridHelper);
    
    const objectTypes = [
        { geometry: new THREE.BoxGeometry(2, 2, 2), name: 'Cube', points: 10 },
        { geometry: new THREE.SphereGeometry(1.2, 32, 32), name: 'Sphere', points: 15 },
        { geometry: new THREE.ConeGeometry(1.2, 2.5, 32), name: 'Cone', points: 20 },
        { geometry: new THREE.TorusGeometry(1, 0.4, 16, 100), name: 'Torus', points: 25 },
        { geometry: new THREE.OctahedronGeometry(1.5), name: 'Octahedron', points: 30 }
    ];
    
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0x6c5ce7, 0xa29bfe];
    
    for (let i = 0; i < 15; i++) {
        const typeIndex = Math.floor(Math.random() * objectTypes.length);
        const type = objectTypes[typeIndex];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const material = new THREE.MeshStandardMaterial({ 
            color,
            roughness: 0.7,
            metalness: 0.3
        });
        
        const mesh = new THREE.Mesh(type.geometry, material);
        mesh.position.set(
            (Math.random() - 0.5) * 30,
            Math.random() * 3,
            (Math.random() - 0.5) * 30
        );
        mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        mesh.userData = {
            type: type.name,
            points: type.points,
            originalColor: color,
            selected: false,
            clickCount: 0
        };
        
        scene.add(mesh);
        interactableObjects.push(mesh);
    }
    
    const targetGeometry = new THREE.RingGeometry(0.8, 1.2, 32);
    const targetMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffd93d,
        side: THREE.DoubleSide
    });
    
    for (let i = 0; i < 5; i++) {
        const target = new THREE.Mesh(targetGeometry, targetMaterial);
        target.position.set(
            (Math.random() - 0.5) * 30,
            Math.random() * 5 + 5,
            (Math.random() - 0.5) * 30
        );
        target.lookAt(camera.position);
        
        target.userData = {
            type: 'Target',
            points: 50,
            isTarget: true
        };
        
        scene.add(target);
        interactableObjects.push(target);
    }
}

function setupEventListeners() {
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('dblclick', onDoubleClick);
    renderer.domElement.addEventListener('contextmenu', onRightClick);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects);
    
    if (hoveredObject && hoveredObject !== selectedObject) {
        hoveredObject.scale.set(1, 1, 1);
        if (!hoveredObject.userData.selected) {
            hoveredObject.material.emissive = new THREE.Color(0x000000);
        }
    }
    
    if (intersects.length > 0) {
        const object = intersects[0].object;
        
        if (object !== hoveredObject) {
            hoveredObject = object;
            
            if (!object.userData.selected) {
                object.scale.set(1.1, 1.1, 1.1);
                object.material.emissive = new THREE.Color(0x222222);
            }
            
            tooltip.innerHTML = `
                <strong>${object.userData.type}</strong><br>
                Points: ${object.userData.points}<br>
                Clicks: ${object.userData.clickCount || 0}
            `;
            tooltip.style.display = 'block';
        }
        
        tooltip.style.left = event.clientX + 10 + 'px';
        tooltip.style.top = event.clientY + 10 + 'px';
        
        document.body.style.cursor = 'pointer';
    } else {
        hoveredObject = null;
        tooltip.style.display = 'none';
        document.body.style.cursor = 'crosshair';
    }
}

function onClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects);
    
    if (intersects.length > 0) {
        const object = intersects[0].object;
        
        switch(interactionMode) {
            case 'select':
                selectObject(object);
                break;
            case 'paint':
                paintObject(object);
                break;
            case 'destroy':
                destroyObject(object);
                break;
        }
        
        object.userData.clickCount = (object.userData.clickCount || 0) + 1;
    }
}

function selectObject(object) {
    if (selectedObject && selectedObject !== object) {
        selectedObject.material.emissive = new THREE.Color(0x000000);
        selectedObject.userData.selected = false;
    }
    
    if (object.userData.selected) {
        object.material.emissive = new THREE.Color(0x000000);
        object.userData.selected = false;
        selectedObject = null;
    } else {
        object.material.emissive = new THREE.Color(0x444444);
        object.userData.selected = true;
        selectedObject = object;
        
        const targetPosition = new THREE.Vector3(
            object.position.x,
            object.position.y + 5,
            object.position.z
        );
        
        animateCameraToTarget(targetPosition);
    }
}

function paintObject(object) {
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0x6c5ce7, 0xa29bfe];
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    object.material.color.setHex(newColor);
    
    createParticles(object.position, newColor);
    
    score += 5;
    updateScore();
}

function destroyObject(object) {
    if (object.userData.isTarget) {
        score += object.userData.points;
        createExplosion(object.position);
    } else {
        score += object.userData.points / 2;
        createParticles(object.position, object.material.color.getHex());
    }
    
    const index = interactableObjects.indexOf(object);
    if (index > -1) {
        interactableObjects.splice(index, 1);
    }
    
    scene.remove(object);
    object.geometry.dispose();
    object.material.dispose();
    
    updateScore();
}

function onDoubleClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects);
    
    if (intersects.length > 0) {
        const object = intersects[0].object;
        
        const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0x6c5ce7];
        const newColor = colors[Math.floor(Math.random() * colors.length)];
        
        object.material.color.setHex(newColor);
        object.userData.originalColor = newColor;
        
        createParticles(object.position, newColor);
        
        score += 10;
        updateScore();
    }
}

function onRightClick(event) {
    event.preventDefault();
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects);
    
    if (intersects.length > 0) {
        const object = intersects[0].object;
        destroyObject(object);
    }
}

function onMouseDown(event) {
    if (interactionMode === 'move' && hoveredObject) {
        controls.enabled = false;
        dragControls = {
            object: hoveredObject,
            startPos: hoveredObject.position.clone(),
            plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
        };
    }
}

function onMouseUp(event) {
    if (dragControls) {
        controls.enabled = true;
        dragControls = null;
    }
}

function createParticles(position, color) {
    const particleCount = 20;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.SphereGeometry(0.1);
        const material = new THREE.MeshBasicMaterial({ color });
        const particle = new THREE.Mesh(geometry, material);
        
        particle.position.copy(position);
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            Math.random() * 0.5,
            (Math.random() - 0.5) * 0.5
        );
        
        scene.add(particle);
        particles.push(particle);
    }
    
    let frame = 0;
    function animateParticles() {
        frame++;
        
        particles.forEach(particle => {
            particle.position.add(particle.velocity);
            particle.velocity.y -= 0.02;
            particle.scale.multiplyScalar(0.95);
            
            if (frame > 30) {
                scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
            }
        });
        
        if (frame <= 30) {
            requestAnimationFrame(animateParticles);
        }
    }
    
    animateParticles();
}

function createExplosion(position) {
    const explosionGeometry = new THREE.SphereGeometry(0.1);
    const explosionMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffd93d,
        transparent: true
    });
    const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
    explosion.position.copy(position);
    scene.add(explosion);
    
    let scale = 1;
    function animateExplosion() {
        scale += 0.5;
        explosion.scale.set(scale, scale, scale);
        explosionMaterial.opacity -= 0.05;
        
        if (explosionMaterial.opacity > 0) {
            requestAnimationFrame(animateExplosion);
        } else {
            scene.remove(explosion);
            explosion.geometry.dispose();
            explosion.material.dispose();
        }
    }
    
    animateExplosion();
}

function animateCameraToTarget(targetPosition) {
    const startPosition = controls.target.clone();
    const duration = 1000;
    const startTime = Date.now();
    
    function updateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        controls.target.lerpVectors(startPosition, targetPosition, easeProgress);
        
        if (progress < 1) {
            requestAnimationFrame(updateCamera);
        }
    }
    
    updateCamera();
}

function updateScore() {
    scoreElement.textContent = score;
    scoreElement.style.transform = 'scale(1.5)';
    setTimeout(() => {
        scoreElement.style.transform = 'scale(1)';
    }, 200);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (dragControls && dragControls.object) {
        raycaster.setFromCamera(mouse, camera);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragControls.plane, intersectPoint);
        dragControls.object.position.x = intersectPoint.x;
        dragControls.object.position.z = intersectPoint.z;
    }
    
    interactableObjects.forEach(object => {
        if (object.userData.isTarget) {
            object.rotation.z += 0.02;
            object.position.y += Math.sin(Date.now() * 0.001) * 0.01;
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

window.setMode = function(mode) {
    interactionMode = mode;
    
    document.querySelectorAll('.interaction-mode button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (mode === 'move') {
        controls.enabled = true;
    }
};

init();
animate();