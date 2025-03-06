import { useThree } from '@react-three/fiber';
import { useAtom, useSetAtom } from 'jotai';
import React, { useEffect, useRef } from 'react'
import * as THREE from "three"
import { dotAtom, firstVectorAtom, lastVectorAtom } from '../utils/atom';
import { deleteDot } from '../utils/collectFun';

const CanvasClickEvent = ({ dimensionsClick }: { dimensionsClick: boolean }) => {

    const { camera, pointer, scene } = useThree();
    const firstMouse = useRef({ x: 0, y: 0 })

    const setFirstVector = useSetAtom(firstVectorAtom)
    const setUpdateLine = useSetAtom(lastVectorAtom)
    const setPointDots = useSetAtom(dotAtom)

    const isDimensions = useRef(false)
    //마우스 드래그 체크
    const isDrag = useRef(false)
    const isClick = useRef(0)


    const rayCasterFun = () => {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(pointer, camera);

        if (!scene) {
            console.error('scene이 없습니다');
            return null;
        }
        const newChildren = scene.children.filter(child => {
            return !child.name.includes("dimensionLine") && !child.name.includes("circle")
        })

        const intersects = raycaster.intersectObjects(newChildren, true);
        if (!intersects.length) return null;

        const { point: targetPoint, normal: targetNormal } = intersects[0];

        return {
            point: targetPoint,
            normal: targetNormal?.normalize()
        };
    };

    const handleMouseDown = (e: MouseEvent) => {

        if (isDimensions.current) {
            firstMouse.current.x = e.clientX
            firstMouse.current.y = e.clientY

            isDrag.current = true;

        }
    };

    const mouseMoveEvent = (e: MouseEvent) => {
        if (isDimensions.current && isDrag.current && isClick.current < 3) {
            const raycastResult = rayCasterFun();
            if (raycastResult) {
                if (raycastResult.normal) {
                    setUpdateLine({
                        position: raycastResult.point,
                        normal: raycastResult.normal
                    })
                }
            }
        }
    }



    const mouseUpEvent = (e: MouseEvent) => {

        isDrag.current = false
        if (isDimensions.current && firstMouse.current.x ===
            e.clientX && firstMouse.current.y === e.clientY) {
            if (isClick.current >= 4) {
                isClick.current = 0
            }
            isClick.current += 1

            const raycastResult = rayCasterFun();
            if (raycastResult) {
                if (raycastResult.normal) {
                    if (isClick.current < 3) {
                        setFirstVector({
                            position: raycastResult.point.clone(),
                            normal: raycastResult.normal.clone()
                        })
                    }

                    setPointDots({
                        position: raycastResult.point.clone(),
                        normal: raycastResult.normal.clone()
                    });

                }
                isDrag.current = true;
            }
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