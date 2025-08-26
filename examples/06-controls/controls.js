import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

let scene, camera, renderer;
let currentControls, controlType = 'orbit';
let clock = new THREE.Clock();
let selectedObject;
let objects = [];

const movement = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    canJump: false,
    velocity: new THREE.Vector3(),
    direction: new THREE.Vector3()
};

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 10, 100);
    
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
    
    setupLights();
    createScene();
    setupControls('orbit');
    
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
}

function setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
}

function createScene() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundTexture = new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(50, 50);
    
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3a7c3a,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0x6c5ce7];
    const geometries = [
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.SphereGeometry(1.5, 32, 32),
        new THREE.ConeGeometry(1.5, 3, 32),
        new THREE.TorusGeometry(1.5, 0.5, 16, 100),
        new THREE.OctahedronGeometry(1.5)
    ];
    
    for (let i = 0; i < 10; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const material = new THREE.MeshStandardMaterial({ 
            color: colors[Math.floor(Math.random() * colors.length)],
            roughness: 0.7,
            metalness: 0.3
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            (Math.random() - 0.5) * 40,
            Math.random() * 3 + 1,
            (Math.random() - 0.5) * 40
        );
        mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        scene.add(mesh);
        objects.push(mesh);
    }
    
    for (let i = 0; i < 20; i++) {
        const height = Math.random() * 10 + 5;
        const buildingGeometry = new THREE.BoxGeometry(
            Math.random() * 4 + 2,
            height,
            Math.random() * 4 + 2
        );
        const buildingMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x808080,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(
            (Math.random() - 0.5) * 80,
            height / 2,
            (Math.random() - 0.5) * 80
        );
        building.castShadow = true;
        building.receiveShadow = true;
        
        scene.add(building);
    }
    
    selectedObject = objects[0];
}

function setupControls(type) {
    if (currentControls) {
        if (currentControls.dispose) currentControls.dispose();
        currentControls = null;
    }
    
    controlType = type;
    document.querySelector('.crosshair').style.display = 'none';
    
    switch(type) {
        case 'orbit':
            currentControls = new OrbitControls(camera, renderer.domElement);
            currentControls.enableDamping = true;
            currentControls.dampingFactor = 0.05;
            currentControls.maxPolarAngle = Math.PI * 0.45;
            currentControls.minDistance = 5;
            currentControls.maxDistance = 50;
            
            document.getElementById('control-instructions').innerHTML = 
                '<strong>Orbit Controls:</strong><br>' +
                '• Left Click: Rotate<br>' +
                '• Right Click: Pan<br>' +
                '• Scroll: Zoom';
            break;
            
        case 'firstperson':
            camera.position.set(0, 2, 10);
            currentControls = new PointerLockControls(camera, document.body);
            
            renderer.domElement.addEventListener('click', () => {
                currentControls.lock();
            });
            
            currentControls.addEventListener('lock', () => {
                document.querySelector('.crosshair').style.display = 'block';
            });
            
            currentControls.addEventListener('unlock', () => {
                document.querySelector('.crosshair').style.display = 'none';
            });
            
            document.getElementById('control-instructions').innerHTML = 
                '<strong>First Person:</strong><br>' +
                '• Click to capture mouse<br>' +
                '• WASD: Move<br>' +
                '• Mouse: Look<br>' +
                '• ESC: Release mouse';
            break;
            
        case 'fly':
            currentControls = new FlyControls(camera, renderer.domElement);
            currentControls.movementSpeed = 10;
            currentControls.rollSpeed = Math.PI / 6;
            currentControls.dragToLook = true;
            
            document.getElementById('control-instructions').innerHTML = 
                '<strong>Fly Controls:</strong><br>' +
                '• WASD: Move<br>' +
                '• RF: Up/Down<br>' +
                '• QE: Roll<br>' +
                '• Mouse: Look (drag)';
            break;
            
        case 'transform':
            currentControls = new OrbitControls(camera, renderer.domElement);
            currentControls.enableDamping = true;
            currentControls.dampingFactor = 0.05;
            
            const transformControls = new TransformControls(camera, renderer.domElement);
            transformControls.attach(selectedObject);
            scene.add(transformControls);
            
            transformControls.addEventListener('dragging-changed', (event) => {
                currentControls.enabled = !event.value;
            });
            
            window.addEventListener('keydown', (event) => {
                switch(event.key) {
                    case 'g':
                        transformControls.mode = 'translate';
                        break;
                    case 'r':
                        transformControls.mode = 'rotate';
                        break;
                    case 's':
                        transformControls.mode = 'scale';
                        break;
                }
            });
            
            currentControls.transformControls = transformControls;
            
            document.getElementById('control-instructions').innerHTML = 
                '<strong>Transform Controls:</strong><br>' +
                '• G: Move mode<br>' +
                '• R: Rotate mode<br>' +
                '• S: Scale mode<br>' +
                '• Drag arrows to transform';
            break;
    }
    
    document.querySelectorAll('.control-panel button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target?.classList.add('active');
}

function onKeyDown(event) {
    if (controlType === 'firstperson' && currentControls.isLocked) {
        switch(event.code) {
            case 'KeyW':
                movement.forward = true;
                break;
            case 'KeyS':
                movement.backward = true;
                break;
            case 'KeyA':
                movement.left = true;
                break;
            case 'KeyD':
                movement.right = true;
                break;
            case 'Space':
                if (movement.canJump) movement.velocity.y += 10;
                movement.canJump = false;
                break;
        }
    }
}

function onKeyUp(event) {
    if (controlType === 'firstperson') {
        switch(event.code) {
            case 'KeyW':
                movement.forward = false;
                break;
            case 'KeyS':
                movement.backward = false;
                break;
            case 'KeyA':
                movement.left = false;
                break;
            case 'KeyD':
                movement.right = false;
                break;
        }
    }
}

function updateFirstPersonControls(delta) {
    if (currentControls.isLocked) {
        movement.velocity.x -= movement.velocity.x * 10.0 * delta;
        movement.velocity.z -= movement.velocity.z * 10.0 * delta;
        movement.velocity.y -= 9.8 * 10.0 * delta;
        
        movement.direction.z = Number(movement.forward) - Number(movement.backward);
        movement.direction.x = Number(movement.right) - Number(movement.left);
        movement.direction.normalize();
        
        if (movement.forward || movement.backward) {
            movement.velocity.z -= movement.direction.z * 40.0 * delta;
        }
        if (movement.left || movement.right) {
            movement.velocity.x -= movement.direction.x * 40.0 * delta;
        }
        
        currentControls.moveRight(-movement.velocity.x * delta);
        currentControls.moveForward(-movement.velocity.z * delta);
        
        camera.position.y += movement.velocity.y * delta;
        
        if (camera.position.y < 2) {
            movement.velocity.y = 0;
            camera.position.y = 2;
            movement.canJump = true;
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    objects.forEach((obj, index) => {
        obj.rotation.x += 0.005 * (index + 1) * 0.2;
        obj.rotation.y += 0.01 * (index + 1) * 0.2;
        obj.position.y = Math.sin(Date.now() * 0.001 + index) * 0.5 + 2;
    });
    
    if (controlType === 'orbit' && currentControls) {
        currentControls.update();
    } else if (controlType === 'fly' && currentControls) {
        currentControls.update(delta);
    } else if (controlType === 'firstperson' && currentControls) {
        updateFirstPersonControls(delta);
    } else if (controlType === 'transform' && currentControls) {
        currentControls.update();
    }
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.switchControls = function(type) {
    setupControls(type);
};

init();
animate();