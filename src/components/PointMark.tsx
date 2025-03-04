import { useAtomValue } from 'jotai';
import React, { useEffect } from 'react'
import { firstVectorAtom } from '../utils.ts/atom';
import * as THREE from "three"
import { useThree } from '@react-three/fiber';

const PointMark = () => {
    const { scene } = useThree()
    const firstClickVector = useAtomValue(firstVectorAtom)

    useEffect(() => {

        if (firstClickVector.position.x && scene || firstClickVector.position.y && scene ||
            firstClickVector.position.z && scene
        ) {
            const geometry = new THREE.CircleGeometry(1, 32);
            const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
            const circle = new THREE.Mesh(geometry, material);
            const newPointTarget = firstClickVector.position
                .clone()
                .add(
                    new THREE.Vector3(
                        firstClickVector.normal.x,
                        firstClickVector.normal.y,
                        firstClickVector.normal.z,
                    ).multiplyScalar(0.01),
                );
            circle.position.copy(newPointTarget)
            circle.scale.set(0.05, 0.05, 0.05)
            circle.lookAt(
                firstClickVector.position.clone().add(firstClickVector.normal),
            );
            scene.add(circle);
            circle.name = `circle.${circle.uuid}`
        }
    }, [firstClickVector, scene])

    return null;
}

export default PointMark