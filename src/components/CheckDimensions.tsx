
import React, { useEffect, useState } from 'react'
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from "three"
import onlyBase from "/onlyBase.glb?url"
const CheckDimensions = () => {

    const [gltfScene, setGltfScene] = useState<THREE.Group | null>(null);

    useEffect(() => {
        const loader = new GLTFLoader();
        loader.load(onlyBase, (gltf) => {
            setGltfScene(gltf.scene);
        });
    }, []);

    return gltfScene ? <primitive object={gltfScene} /> : null;
}

export default CheckDimensions