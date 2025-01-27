import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export function createTextGeometry(scoreValue, font) {
    return new TextGeometry(scoreValue.toString(), {
        font: font,
        size: 2,
        depth: 0.5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 5
    });
}