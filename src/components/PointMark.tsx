import { useAtom } from 'jotai';
import { useEffect, useState } from 'react'
import { dotAtom } from '../utils/atom';
import * as THREE from "three"
import { useThree } from '@react-three/fiber';
import { deleteDot } from '../utils/collectFun';

const PointMark = () => {
    const { scene } = useThree()
    const [dotPoints] = useAtom(dotAtom)

    const [pointArray, setPointArray] = useState<{
        position: THREE.Vector3;
        normal: THREE.Vector3;
    }[]>([])

    useEffect(() => {
        if (dotPoints) {
            if (pointArray.length >= 2) {
                deleteDot(scene);
                setPointArray([dotPoints]);
            } else {
                setPointArray(pre => [...pre, dotPoints]);
            }
        }

    }, [scene, dotPoints]);

    useEffect(() => {

        // dotPoints 배열의 각 점에 대해 mesh가 없으면 생성 후 scene에 추가
        pointArray.forEach((point, index) => {
            // 해당 이름의 mesh가 이미 존재하면 건너뛰기
            if (scene.getObjectByName(`circle.${index}`)) return;
            const geometry = new THREE.CircleGeometry(1, 32);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                side: THREE.DoubleSide,
            });
            const circle = new THREE.Mesh(geometry, material);
            const newPointTarget = point.position.clone().add(
                new THREE.Vector3(
                    point.normal.x,
                    point.normal.y,
                    point.normal.z
                ).multiplyScalar(0.01)
            );
            // 점의 위치로 mesh 배치
            circle.position.copy(newPointTarget);
            circle.lookAt(point.position.clone().add(point.normal));
            circle.scale.set(0.05, 0.05, 0.05);

            // scene에 안전하게 mesh 추가
            scene.add(circle);
            circle.name = `circle.${index}`;
        });
        return () => {
            deleteDot(scene)
        };
    }, [pointArray, scene]);

    return null;
}

export default PointMark


