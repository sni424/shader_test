import { useThree } from '@react-three/fiber';
import { useSetAtom } from 'jotai';
import React, { useEffect, useRef } from 'react'
import * as THREE from "three"
import { firstVectorAtom } from '../utils.ts/atom';

const CanvasClickEvent = ({ dimensionsClick }: { dimensionsClick: boolean }) => {

    const { camera, pointer, scene } = useThree();
    const firstMouse = useRef({ x: 0, y: 0 })
    const startPositionVector = useRef<THREE.Vector3>(new THREE.Vector3())
    const startNormalVector = useRef<THREE.Vector3>(new THREE.Vector3())
    const setFirstVector = useSetAtom(firstVectorAtom)
    //마우스 드래그 체크
    const isDrag = useRef(false)

    const rayCasterFun = () => {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(pointer, camera);


        if (!scene) {
            throw new Error('no model');
        }

        const intersects = raycaster.intersectObjects(scene.children, true);

        if (!intersects.length) return;

        const { point: targetPoint, normal: targetNormal } = intersects[0]
        console.log("rayCasterFun", targetPoint, targetNormal, targetNormal?.normalize())
        startPositionVector.current = targetPoint
        if (targetNormal) {
            startNormalVector.current = targetNormal
        }
    }

    const touchStartEvent = (e: MouseEvent) => {
        if (dimensionsClick) {
            firstMouse.current = {
                x: e.clientX,
                y: e.clientY
            }
            isDrag.current = true
            rayCasterFun()
        }
    }

    const mouseMoveEvent = (e: MouseEvent) => {
        if (dimensionsClick && isDrag.current) {
            // console.log("확인", startVector, isDrag.current)
        }
    }

    const mouseUpEvent = (e: MouseEvent) => {
        isDrag.current = false
        if (dimensionsClick && firstMouse.current.x ===
            e.clientX && firstMouse.current.y === e.clientY) {
            setFirstVector({
                position: startPositionVector.current,
                normal: startNormalVector.current
            })
        }
    }

    useEffect(() => {
        const element = document.getElementById('canvasDiv');

        if (!element) {
            console.error("no element");
            return
        }
        element.addEventListener("mousedown", (e) => touchStartEvent(e));
        element.addEventListener("mousemove", (e) => mouseMoveEvent(e));
        element.addEventListener("mouseup", (e) => mouseUpEvent(e));

        return () => {
            if (element) {
                element.removeEventListener("mousedown", (e) => touchStartEvent(e));
                element.removeEventListener("mousemove", (e) => mouseMoveEvent(e));
                element.removeEventListener("mouseup", (e) => mouseUpEvent(e));
            }
        };
    }, [dimensionsClick]);
    return null;
}

export default CanvasClickEvent