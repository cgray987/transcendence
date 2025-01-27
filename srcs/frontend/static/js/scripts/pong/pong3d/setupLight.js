import * as THREE from 'three';

export function setupLighting(scene) {
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

	const light1 = new THREE.SpotLight( 0xffffff, 150, 0, 1.75, 0.5 );
	light1.castShadow = true;
	light1.position.set(15, 20, 0);
	scene.add( light1 );
	const light2 = new THREE.SpotLight( 0xffffff, 150, 0, 1.5, 0.5 );
	light2.castShadow = true;
	light2.position.set(-15, 20, 0);
	scene.add( light2 );
}