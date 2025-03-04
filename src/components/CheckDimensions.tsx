
import React, { useEffect, useState } from 'react'
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from "three"

const CheckDimensions = () => {

    const [gltfScene, setGltfScene] = useState<THREE.Group | null>(null);

    useEffect(() => {
        const loader = new GLTFLoader();
        loader.load("https://vra-configurator-dev.s3.ap-northeast-2.amazonaws.com/jonghyeok/onlyBase.glb", (gltf) => {
            setGltfScene(gltf.scene);
        });
    }, []);

    return gltfScene ? <primitive object={gltfScene} /> : null;
}

export default CheckDimensions