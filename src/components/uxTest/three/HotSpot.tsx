import { Html } from "@react-three/drei";

import CardSlide from "../ui/CardSlide";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three"
import { useEffect, useState } from "react";
import { modalAtom, setAtomValue } from "../../../utils/atom";

const htmlPositionArray = [0.3972477061170564, 0.569830445749207, -3.680268048963994]


function HotSpot() {

    const { camera } = useThree();
    const htmlPosition = new THREE.Vector3().fromArray(htmlPositionArray);
    const [isVisible, setIsVisible] = useState(false);

    useFrame(() => {
        if (camera) {
            const distance = camera.position.distanceTo(htmlPosition);
            setIsVisible(distance < 1.2);
        }
    });



    return (
        <Html position={htmlPosition} center>
            <div className={`hotspot-container ${isVisible ? 'visible' : ''}`}>
                <div className="trigger-dot" onClick={() => {
                    setAtomValue(modalAtom, true)
                }}>
                    <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </div>
                <CardSlide />
            </div>
        </Html>
    );
}

export default HotSpot;