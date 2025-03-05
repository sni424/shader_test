import { useThree } from '@react-three/fiber';
import { useSetAtom } from 'jotai';
import React, { useEffect, useRef } from 'react'
import * as THREE from "three"
import { firstVectorAtom, updateLineAtom } from '../utils.ts/atom';

const CanvasClickEvent = ({ dimensionsClick }: { dimensionsClick: boolean }) => {

    const { camera, pointer, scene } = useThree();
    const firstMouse = useRef({ x: 0, y: 0 })
    const startPositionVector = useRef<THREE.Vector3>(new THREE.Vector3())
    const startNormalVector = useRef<THREE.Vector3>(new THREE.Vector3())
    const setFirstVector = useSetAtom(firstVectorAtom)
    const setUpdateLine = useSetAtom(updateLineAtom)
    const startPointRef = useRef<THREE.Vector3>(new THREE.Vector3())
    const isDimensions = useRef(false)
    //마우스 드래그 체크
    const isDrag = useRef(false)


    const rayCasterFun = () => {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(pointer, camera);

        if (!scene) {
            console.error('scene이 없습니다');
            return null;
        }

        const intersects = raycaster.intersectObjects(scene.children, true);
        if (!intersects.length) return null;

        const { point: targetPoint, normal: targetNormal } = intersects[0];
        console.log("dimensionsClick", intersects[0])
        return {
            point: targetPoint,
            normal: targetNormal?.normalize()
        };
    };

    const handleMouseDown = (e: MouseEvent) => {
        console.log("dimensionsClick", isDimensions.current)
        if (isDimensions.current) {
            const raycastResult = rayCasterFun();
            if (raycastResult) {

                if (raycastResult.normal) {

                    setFirstVector({
                        position: raycastResult.point,
                        normal: raycastResult.normal
                    })
                    startPointRef.current = raycastResult.point
                }
                isDrag.current = true;
            }
        }
    };

    const mouseMoveEvent = (e: MouseEvent) => {
        if (isDimensions.current && !isDrag.current) {


            // 현재 마우스 위치로 레이캐스팅
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(
                new THREE.Vector2(
                    (e.clientX / window.innerWidth) * 2 - 1,
                    -(e.clientY / window.innerHeight) * 2 + 1
                ),
                camera
            );

            const intersects = raycaster.intersectObjects(scene.children, true);
            if (intersects.length > 0 && startPointRef.current) {
                const currentPoint = intersects[0].point;


                const distance = startPointRef.current.distanceTo(currentPoint);


                const lineDirection = currentPoint.clone().sub(startPointRef.current).normalize();
                const endPoint = startPointRef.current.clone().add(
                    lineDirection.multiplyScalar(distance)
                );
                // console.log("endPoint", endPoint)


            }
        }
    }



    const mouseUpEvent = (e: MouseEvent) => {
        isDrag.current = false
        if (isDimensions.current && firstMouse.current.x ===
            e.clientX && firstMouse.current.y === e.clientY) {
            setFirstVector({
                position: startPositionVector.current,
                normal: startNormalVector.current
            })
        }
    }

    useEffect(() => {
        if (dimensionsClick) {
            isDimensions.current = true
        } else {
            isDimensions.current = false
        }
    }, [dimensionsClick])

    useEffect(() => {
        const element = document.getElementById('canvasDiv');

        if (!element) {
            console.error("no element");
            return
        }
        element.addEventListener("mousedown", (e) => handleMouseDown(e));
        element.addEventListener("mousemove", (e) => mouseMoveEvent(e));
        element.addEventListener("mouseup", (e) => mouseUpEvent(e));

        return () => {
            if (element) {
                element.removeEventListener("mousedown", (e) => handleMouseDown(e));
                element.removeEventListener("mousemove", (e) => mouseMoveEvent(e));
                element.removeEventListener("mouseup", (e) => mouseUpEvent(e));
            }
        };
    }, []);
    return null;
}

export default CanvasClickEvent