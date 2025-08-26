import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import * as CANNON from 'cannon-es';

let scene, camera, renderer, controls;
let world;
let clock = new THREE.Clock();

let gameState = {
    isPlaying: false,
    health: 100,
    energy: 100,
    score: 0,
    level: 1,
    crystals: [],
    enemies: [],
    bullets: [],
    playerBody: null,
    playerMesh: null,
    canJump: false,
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    isSprinting: false,
    velocity: new THREE.Vector3()
};

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.02);
    
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2, 0);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    controls = new PointerLockControls(camera, document.body);
    
    setupPhysics();
    setupLights();
    createEnvironment();
    setupEventListeners();
    
    window.addEventListener('resize', onWindowResize);
}

function setupPhysics() {
    world = new CANNON.World({
        gravity: new CANNON.Vec3(0, -20, 0)
    });
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    
    const defaultMaterial = new CANNON.Material('default');
    const defaultContactMaterial = new CANNON.ContactMaterial(
        defaultMaterial,
        defaultMaterial,
        {
            friction: 0.4,
            restitution: 0.1
        }
    );
    world.addContactMaterial(defaultContactMaterial);
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
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xff6b6b, 1, 50);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);
}

function createEnvironment() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3a7c3a,
        roughness: 0.8
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
    
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({
        mass: 0,
        shape: groundShape
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);
    
    for (let i = 0; i < 20; i++) {
        const size = Math.random() * 5 + 2;
        const height = Math.random() * 10 + 5;
        
        const geometry = new THREE.BoxGeometry(size, height, size);
        const material = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(Math.random() * 0.3 + 0.3, Math.random() * 0.3 + 0.3, Math.random() * 0.3 + 0.3),
            roughness: 0.9
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        const x = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * 80;
        mesh.position.set(x, height/2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        
        const shape = new CANNON.Box(new CANNON.Vec3(size/2, height/2, size/2));
        const body = new CANNON.Body({
            mass: 0,
            shape: shape,
            position: new CANNON.Vec3(x, height/2, z)
        });
        world.addBody(body);
    }
}

function createPlayer() {
    const playerGeometry = new THREE.CapsuleGeometry(0.5, 2, 8, 16);
    const playerMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00a550,
        roughness: 0.7
    });
    gameState.playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
    gameState.playerMesh.position.set(0, 2, 0);
    gameState.playerMesh.castShadow = true;
    
    const playerShape = new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5));
    gameState.playerBody = new CANNON.Body({
        mass: 1,
        shape: playerShape,
        position: new CANNON.Vec3(0, 2, 0)
    });
    world.addBody(gameState.playerBody);
}

function spawnCrystals() {
    for (let i = 0; i < 5; i++) {
        const crystalGroup = new THREE.Group();
        
        const geometry = new THREE.OctahedronGeometry(0.5);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xffd93d,
            emissive: 0xffd93d,
            emissiveIntensity: 0.3,
            roughness: 0.2,
            metalness: 0.8
        });
        const crystal = new THREE.Mesh(geometry, material);
        crystalGroup.add(crystal);
        
        const glowGeometry = new THREE.SphereGeometry(0.8);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffd93d,
            transparent: true,
            opacity: 0.2
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        crystalGroup.add(glow);
        
        crystalGroup.position.set(
            (Math.random() - 0.5) * 60,
            1.5,
            (Math.random() - 0.5) * 60
        );
        
        scene.add(crystalGroup);
        gameState.crystals.push(crystalGroup);
    }
}

function spawnEnemies() {
    for (let i = 0; i < 3 + gameState.level; i++) {
        const enemyGeometry = new THREE.ConeGeometry(0.5, 1.5, 8);
        const enemyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff4444,
            emissive: 0xff0000,
            emissiveIntensity: 0.2
        });
        const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
        
        enemy.position.set(
            (Math.random() - 0.5) * 60,
            0.75,
            (Math.random() - 0.5) * 60
        );
        
        enemy.castShadow = true;
        enemy.userData = {
            health: 30,
            speed: Math.random() * 2 + 1
        };
        
        scene.add(enemy);
        gameState.enemies.push(enemy);
    }
}

function shootBullet() {
    if (gameState.energy < 10) return;
    
    gameState.energy -= 10;
    updateUI();
    
    const bulletGeometry = new THREE.SphereGeometry(0.1);
    const bulletMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        emissive: 0x00ff00
    });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    
    bullet.position.copy(camera.position);
    
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    bullet.userData = {
        velocity: direction.multiplyScalar(50),
        life: 100
    };
    
    scene.add(bullet);
    gameState.bullets.push(bullet);
}

function updatePlayer(delta) {
    if (!controls.isLocked) return;
    
    const speed = gameState.isSprinting && gameState.energy > 0 ? 15 : 8;
    
    if (gameState.isSprinting && gameState.energy > 0) {
        gameState.energy -= delta * 20;
        if (gameState.energy < 0) gameState.energy = 0;
    } else if (!gameState.isSprinting && gameState.energy < 100) {
        gameState.energy += delta * 10;
        if (gameState.energy > 100) gameState.energy = 100;
    }
    
    gameState.velocity.x -= gameState.velocity.x * 10.0 * delta;
    gameState.velocity.z -= gameState.velocity.z * 10.0 * delta;
    
    const direction = new THREE.Vector3();
    direction.z = Number(gameState.moveForward) - Number(gameState.moveBackward);
    direction.x = Number(gameState.moveRight) - Number(gameState.moveLeft);
    direction.normalize();
    
    if (gameState.moveForward || gameState.moveBackward) {
        gameState.velocity.z -= direction.z * speed * delta;
    }
    if (gameState.moveLeft || gameState.moveRight) {
        gameState.velocity.x -= direction.x * speed * delta;
    }
    
    controls.moveRight(-gameState.velocity.x * delta);
    controls.moveForward(-gameState.velocity.z * delta);
    
    if (gameState.playerBody) {
        gameState.playerBody.position.x = camera.position.x;
        gameState.playerBody.position.z = camera.position.z;
        
        if (camera.position.y < 2) {
            camera.position.y = 2;
            gameState.canJump = true;
        }
    }
}

function updateCrystals() {
    const time = Date.now() * 0.001;
    
    gameState.crystals.forEach((crystal, index) => {
        crystal.rotation.y = time;
        crystal.position.y = 1.5 + Math.sin(time * 2 + index) * 0.3;
        
        const distance = crystal.position.distanceTo(camera.position);
        if (distance < 2) {
            scene.remove(crystal);
            gameState.crystals.splice(gameState.crystals.indexOf(crystal), 1);
            
            gameState.score += 100;
            gameState.health = Math.min(100, gameState.health + 10);
            updateUI();
            
            if (gameState.crystals.length === 0) {
                nextLevel();
            }
        }
    });
}

function updateEnemies(delta) {
    gameState.enemies.forEach(enemy => {
        const direction = new THREE.Vector3();
        direction.subVectors(camera.position, enemy.position);
        direction.y = 0;
        direction.normalize();
        
        enemy.position.add(direction.multiplyScalar(enemy.userData.speed * delta));
        enemy.lookAt(camera.position);
        
        const distance = enemy.position.distanceTo(camera.position);
        if (distance < 2) {
            gameState.health -= delta * 20;
            if (gameState.health <= 0) {
                gameOver();
            }
        }
    });
}

function updateBullets(delta) {
    gameState.bullets.forEach((bullet, bIndex) => {
        bullet.position.add(bullet.userData.velocity.clone().multiplyScalar(delta));
        bullet.userData.life--;
        
        if (bullet.userData.life <= 0) {
            scene.remove(bullet);
            gameState.bullets.splice(bIndex, 1);
            return;
        }
        
        gameState.enemies.forEach((enemy, eIndex) => {
            if (bullet.position.distanceTo(enemy.position) < 1) {
                scene.remove(bullet);
                gameState.bullets.splice(bIndex, 1);
                
                enemy.userData.health -= 10;
                if (enemy.userData.health <= 0) {
                    scene.remove(enemy);
                    gameState.enemies.splice(eIndex, 1);
                    gameState.score += 50;
                    updateUI();
                }
            }
        });
    });
}

function updateUI() {
    document.getElementById('healthValue').textContent = Math.floor(gameState.health);
    document.getElementById('healthBar').style.width = gameState.health + '%';
    
    document.getElementById('energyValue').textContent = Math.floor(gameState.energy);
    document.getElementById('energyBar').style.width = gameState.energy + '%';
    
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('level').textContent = gameState.level;
}

function nextLevel() {
    gameState.level++;
    gameState.score += 500;
    updateUI();
    
    spawnCrystals();
    spawnEnemies();
}

function gameOver() {
    gameState.isPlaying = false;
    controls.unlock();
    
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalLevel').textContent = gameState.level;
    document.getElementById('gameOver').style.display = 'block';
}

function setupEventListeners() {
    controls.addEventListener('lock', () => {
        if (gameState.isPlaying) {
            document.getElementById('instructions').style.display = 'block';
        }
    });
    
    controls.addEventListener('unlock', () => {
        document.getElementById('instructions').style.display = 'none';
    });
    
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('click', onClick);
}

function onKeyDown(event) {
    if (!gameState.isPlaying) return;
    
    switch(event.code) {
        case 'KeyW':
            gameState.moveForward = true;
            break;
        case 'KeyS':
            gameState.moveBackward = true;
            break;
        case 'KeyA':
            gameState.moveLeft = true;
            break;
        case 'KeyD':
            gameState.moveRight = true;
            break;
        case 'Space':
            if (gameState.canJump) {
                camera.position.y += 5;
                gameState.canJump = false;
            }
            break;
        case 'ShiftLeft':
            gameState.isSprinting = true;
            break;
    }
}

function onKeyUp(event) {
    switch(event.code) {
        case 'KeyW':
            gameState.moveForward = false;
            break;
        case 'KeyS':
            gameState.moveBackward = false;
            break;
        case 'KeyA':
            gameState.moveLeft = false;
            break;
        case 'KeyD':
            gameState.moveRight = false;
            break;
        case 'ShiftLeft':
            gameState.isSprinting = false;
            break;
    }
}

function onClick() {
    if (gameState.isPlaying && controls.isLocked) {
        shootBullet();
    }
}

window.startGame = function() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameUI').style.display = 'block';
    
    gameState.isPlaying = true;
    gameState.health = 100;
    gameState.energy = 100;
    gameState.score = 0;
    gameState.level = 1;
    
    createPlayer();
    spawnCrystals();
    spawnEnemies();
    
    controls.lock();
    updateUI();
};

window.restartGame = function() {
    gameState.crystals.forEach(c => scene.remove(c));
    gameState.enemies.forEach(e => scene.remove(e));
    gameState.bullets.forEach(b => scene.remove(b));
    
    gameState.crystals = [];
    gameState.enemies = [];
    gameState.bullets = [];
    
    document.getElementById('gameOver').style.display = 'none';
    startGame();
};

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    if (gameState.isPlaying) {
        world.step(1/60);
        
        updatePlayer(delta);
        updateCrystals();
        updateEnemies(delta);
        updateBullets(delta);
        updateUI();
    }
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
animate();