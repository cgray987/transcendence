import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export function setupScene(canvasRef) {
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(60, canvasRef.width / canvasRef.height, 0.1, 10000);
    camera.position.set(0, 20, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef });
    renderer.setSize(canvasRef.width, canvasRef.height);
	renderer.setClearColor(0x002e40, 0.01);

	const renderScene = new RenderPass(scene, camera);
	const composer = new EffectComposer(renderer)
	composer.addPass(renderScene);

	const bloomPass = new UnrealBloomPass(new THREE.Vector2(canvasRef), 0.2, 0.1, 0.9);
	composer.addPass(bloomPass);

	bloomPass.strength = 0.15;
	bloomPass.radius = 0.2;
	bloomPass.threshold = 0.4;
	
	const outputPass = new OutputPass();
	composer.addPass(outputPass);


    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;

    return { scene, camera, renderer, controls, composer };
}