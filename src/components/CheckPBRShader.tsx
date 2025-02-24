import { useEffect, useRef, useState } from 'react'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import table from "/pbrTable.glb?url"
import * as THREE from "three"

import image1 from "/Image_0.jpg?url"
import image2 from "/image1.jpg?url"
import gsap from 'gsap';
import { useThree } from '@react-three/fiber'


const CheckPBRShader = ({ isClick }: { isClick: boolean }) => {
    const { scene } = useThree()
    const [gltfScene, setGltfScene] = useState<THREE.Group | null>(null);
    const progressRef = useRef({ value: isClick ? 1 : 0 });

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
                const clonedMat = origMat.clone();  // 복제만 하고 바로 사용

                const texture1 = new THREE.TextureLoader().load(image1);
                const texture2 = new THREE.TextureLoader().load(image2);
                texture1.flipY = false;
                texture2.flipY = false;

                clonedMat.onBeforeCompile = (shader) => {
                    shader.uniforms.progress = { value: progressRef.current.value };
                    shader.uniforms.texture1 = { value: texture1 };
                    shader.uniforms.texture2 = { value: texture2 };

                    shader.fragmentShader = `
                        uniform float progress;
                        uniform sampler2D texture1;
                        uniform sampler2D texture2;
                    ` + shader.fragmentShader;

                    shader.fragmentShader = shader.fragmentShader.replace(
                        '#include <map_fragment>',
                        `
                        #ifdef USE_MAP
                            vec4 texColor1 = texture2D(texture1, vMapUv);
                            vec4 texColor2 = texture2D(texture2, vMapUv);
                            vec4 mixedTexColor = mix(texColor1, texColor2, progress);
                            diffuseColor *= mixedTexColor;
                        #endif
                        `
                    );

                    clonedMat.shader = shader;  // clonedMat에 직접 저장
                };

                child.material = clonedMat;  // 바로 적용
            }
        });
    }, [gltfScene]);


    useEffect(() => {


        let foundMesh: THREE.Mesh | null = null;  // 찾은 메시를 저장할 변수

        scene.traverse((child) => {
            if (child.isMesh && child.name === "Hooper_Storage_Coffe_Table_Natural_Ash_ASH_0") {
                foundMesh = child;  // 찾은 메시를 변수에 저장
            }
        });
        if (!foundMesh) return
        console.log("foundMesh", foundMesh);

        if (foundMesh) {  // foundMesh가 있을 때만 애니메이션 실행
            gsap.to(progressRef.current, {
                value: isClick ? 1 : 0,
                duration: 2,
                ease: "power1.inOut",
                onUpdate: function () {
                    foundMesh!.material.shader.uniforms.progress.value = progressRef.current.value;
                }
            });
        }

    }, [isClick]);

    return gltfScene ? <primitive object={gltfScene} /> : null;

}

export default CheckPBRShader