import { useEffect, useRef, useState } from 'react'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import table from "/table_1.glb?url"
import * as THREE from "three"

import image1 from "/Image_0.jpg?url"
import image2 from "/image1.jpg?url"
import gsap from 'gsap';


const ModelTextureTransition = ({ isClick }: { isClick: boolean }) => {

    const [gltfScene, setGltfScene] = useState<THREE.Group | null>(null);
    const progressRef = useRef({ value: isClick ? 1 : 0 });
    const materialRef = useRef<THREE.ShaderMaterial | null>(null);


    useEffect(() => {
        const loader = new GLTFLoader();
        loader.load(table, (gltf) => {
            setGltfScene(gltf.scene);
        });
    }, []);

    useEffect(() => {
        if (!gltfScene) return;

        gltfScene.traverse((child) => {
            if (child.isMesh && child.name === "Hooper_Storage_Coffe_Table_Natural_Ash_ASH_0") {
                const origMat = child.material as THREE.MeshStandardMaterial;

                const texture1 = new THREE.TextureLoader().load(image1);
                const texture2 = new THREE.TextureLoader().load(image2);

                texture1.flipY = false;
                texture2.flipY = false;
                materialRef.current = new THREE.ShaderMaterial({
                    uniforms: {
                        progress: { value: progressRef.current.value },
                        texture1: { value: texture1 },
                        texture2: { value: texture2 },
                    },
                    vertexShader: `
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
                    fragmentShader: `
              uniform float progress;
              uniform sampler2D texture1;
              uniform sampler2D texture2;
              varying vec2 vUv;
              void main() {
                gl_FragColor = mix(texture2D(texture1, vUv), texture2D(texture2, vUv), progress);
              }
            `,
                    transparent: origMat.transparent,
                });

                child.material = materialRef.current;
            }
        });
    }, [gltfScene]);


    useEffect(() => {
        if (!materialRef.current) return;

        gsap.to(progressRef.current, {
            value: isClick ? 1 : 0,
            duration: 2,
            ease: "power1.inOut",
            onUpdate: function () {
                if (materialRef.current) {
                    materialRef.current.uniforms.progress.value = progressRef.current.value;
                }
            }
        });
    }, [isClick]);

    return gltfScene ? <primitive object={gltfScene} /> : null;
};


export default ModelTextureTransition