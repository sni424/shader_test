import { useThree } from '@react-three/fiber';

import { useEffect, useRef } from 'react'
import * as THREE from "three"

const CheckRaycaster = () => {
    const { camera, pointer, scene } = useThree();
    const firstMouse = useRef({ x: 0, y: 0 })
    const isDrag = useRef(false)

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
        firstMouse.current.x = e.clientX
        firstMouse.current.y = e.clientY
        isDrag.current = true
    };

    const mouseUpEvent = (e: MouseEvent) => {
        isDrag.current = false
        if (firstMouse.current.x ===
            e.clientX && firstMouse.current.y === e.clientY) {
            const raycastResult = rayCasterFun();
            if (raycastResult) {
                if (raycastResult.normal) {
                    console.log("position :", raycastResult.point)
                }
                isDrag.current = true;
            }
        }
    }

    useEffect(() => {
        const element = document.getElementById('canvasDiv');
        if (!element) {
            console.error("no element");
            return
        }
        element.addEventListener("mousedown", (e) => handleMouseDown(e));
        element.addEventListener("mouseup", (e) => mouseUpEvent(e));
        return () => {
            if (element) {
                element.removeEventListener("mousedown", (e) => handleMouseDown(e));

                element.removeEventListener("mouseup", (e) => mouseUpEvent(e));
            }
        };
    }, []);
    return null
}

export default CheckRaycaster