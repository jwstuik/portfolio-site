import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';

const SEPARATION = 100, AMOUNTX = 50, AMOUNTY = 50;

let camera, scene, renderer, composer, particles;
let count = 0;

init();
animate();

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;

    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('c'),
        antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const numParticles = AMOUNTX * AMOUNTY;
    const positions = new Float32Array(numParticles * 3);
    const scales = new Float32Array(numParticles);

    let i = 0, j = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2); 
            positions[i + 1] = 0; // y
            positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
            scales[j] = 1;
            i += 3;
            j++;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const particleMaterial = new THREE.PointsMaterial({
        size: 10,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        map: new THREE.TextureLoader().load('https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/sprites/ball.png'),
        depthWrite: false
    });

    particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);


    const renderPass = new RenderPass(scene, camera);


    const bokehPass = new BokehPass(scene, camera, {
        focus: 100.0, 
        aperture: 0.0005, 
        maxblur: 0.005,
    });

    composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bokehPass);


    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const positions = particles.geometry.attributes.position.array;
    const scales = particles.geometry.attributes.scale.array;

    let i = 0, j = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            positions[i + 1] = Math.sin((ix + count) * 0.3) * 50 +
                               Math.sin((iy + count) * 0.5) * 50;
            scales[j] = (Math.sin((ix + count) * 0.3) + 1) * 4 +
                        (Math.sin((iy + count) * 0.5) + 1) * 4;

            i += 3;
            j++;
        }
    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.scale.needsUpdate = true;

    count += 0.05;

    composer.render();
}

