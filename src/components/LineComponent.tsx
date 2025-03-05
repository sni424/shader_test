import { useAtomValue } from 'jotai'
import React, { useEffect, useRef } from 'react'
import { firstVectorAtom, updateLineAtom } from '../utils.ts/atom'
import * as THREE from "three"
import { useThree } from '@react-three/fiber'
const LineComponent = () => {
    const { scene } = useThree();
    const firstVector = useAtomValue(firstVectorAtom);
    const updateLine = useAtomValue(updateLineAtom);
    const lineRef = useRef<THREE.Line | null>(null); // useRef로 line을 보관

    useEffect(() => {
        if (scene && firstVector) {
            const points = [firstVector.position, firstVector.position.clone()];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
            const line = new THREE.Line(geometry, material);
            line.name = "line11"
            scene.add(line);
            lineRef.current = line;
        }
    }, [scene, firstVector]);

    useEffect(() => {
        if (updateLine > 0 && lineRef.current && firstVector) {
            const geometry = lineRef.current.geometry as THREE.BufferGeometry;
            const startPoint = firstVector.position.clone();
            const offsetX = updateLine * firstVector.normal.x;
            const newEndX = startPoint.x + offsetX;
            // y와 z는 startPoint 그대로 유지
            geometry.attributes.position.setXYZ(1, newEndX, startPoint.y, startPoint.z);
            geometry.attributes.position.needsUpdate = true;
        }
    }, [updateLine, firstVector]);

    return null;
};

export default LineComponent;