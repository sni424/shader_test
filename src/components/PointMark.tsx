import { useAtomValue } from 'jotai';
import { useEffect } from 'react'
import { firstVectorAtom } from '../utils.ts/atom';
import * as THREE from "three"
import { useThree } from '@react-three/fiber';

const PointMark = () => {
    const { scene } = useThree()
    const firstClickVector = useAtomValue(firstVectorAtom)

    useEffect(() => {
        if (!firstClickVector || !scene) return;

        // scene이 유효한 객체인지 추가 확인
        if (!(scene instanceof THREE.Scene)) {
            console.error('Invalid scene object', scene);
            return;
        }

        const geometry = new THREE.CircleGeometry(1, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
        const circle = new THREE.Mesh(geometry, material);

        const newPointTarget = firstClickVector.position.clone().add(
            new THREE.Vector3(
                firstClickVector.normal.x,
                firstClickVector.normal.y,
                firstClickVector.normal.z
            ).multiplyScalar(0.01)
        );

        circle.position.copy(newPointTarget);
        circle.scale.set(0.05, 0.05, 0.05);
        circle.lookAt(firstClickVector.position.clone().add(firstClickVector.normal));

        // 안전한 scene 추가 방식
        if (scene.add) {
            scene.add(circle);
        } else {
            console.error('scene.add method is not available', scene);
            return;
        }

        circle.name = `circle.${circle.uuid}`;

        return () => {
            if (scene && scene.children) {
                const circlesToRemove = scene.children.filter(
                    item => item.name && item.name.includes("circle")
                );
                circlesToRemove.forEach((circle) => {
                    const mesh = circle as THREE.Mesh;

                    scene.remove(mesh);

                    if (mesh.geometry) {
                        mesh.geometry.dispose();
                    }

                    if (mesh.material) {
                        if (Array.isArray(mesh.material)) {
                            mesh.material.forEach(mat => {
                                if ('dispose' in mat) {
                                    mat.dispose();
                                }
                            });
                        } else if ('dispose' in mesh.material) {

                            (mesh.material as THREE.Material).dispose();
                        }
                    }
                });
            }
        };
    }, [firstClickVector, scene]);

    return null;
}

export default PointMark