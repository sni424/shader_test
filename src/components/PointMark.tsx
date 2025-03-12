import { useAtom } from 'jotai';
import { useEffect, useState } from 'react'
import { dotAtom } from '../utils/atom';
import * as THREE from "three"
import { useThree } from '@react-three/fiber';
import { deleteDot } from '../utils/collectFun';
import { VectorObject } from '../utils/type';

const PointMark = () => {
    const { scene } = useThree()
    const [dotPoints, setDotPoints] = useAtom(dotAtom)

    const [pointArray, setPointArray] = useState<{
        position: THREE.Vector3;
        normal: THREE.Vector3;
    }[]>([])

    function lookAtOppositeNormal(object: THREE.Mesh, point: VectorObject) {
        // normal의 반대 방향 계산 및 정규화
        const oppositeNormal = point.normal.clone().negate().normalize();
        // ConeGeometry는 기본적으로 Y축(0,1,0)을 향하므로, 이 축에서 반대 normal로 회전
        object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), oppositeNormal);

    }


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
            const geometry = new THREE.ConeGeometry(3, 10, 32);
            const material = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                side: THREE.DoubleSide,
            });
            const circle = new THREE.Mesh(geometry, material);
            const newPointTarget = point.position.clone().add(
                new THREE.Vector3(point.normal.x, point.normal.y, point.normal.z).multiplyScalar(0.02)
            );

            circle.position.copy(newPointTarget);
            lookAtOppositeNormal(circle, point);
            circle.scale.set(0.004, 0.004, 0.004);
            scene.add(circle);
            circle.name = `circle.${index}`;
        });

    }, [pointArray, scene]);

    useEffect(() => {
        return () => {
            deleteDot(scene)
            setDotPoints(null)
        }
    }, [])

    return null;
}

export default PointMark


