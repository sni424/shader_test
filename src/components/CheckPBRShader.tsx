import { useEffect, useRef, useState } from 'react'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import floor from "/floor.glb?url"
import livingRoom from "/livingRoom.glb?url"
import * as THREE from "three"

import image1 from "/dpOn.jpg?url"
import image2 from "/dpOff.jpg?url"
import image3 from "/dpLightMap.jpg?url"
import gsap from 'gsap';
import { useThree } from '@react-three/fiber'


const CheckPBRShader = ({ isClick }: { isClick: boolean }) => {
    const { scene } = useThree()
    const [gltfScene, setGltfScene] = useState<THREE.Group | null>(null);
    const progressRef = useRef({ value: isClick ? 1 : 0 });


    useEffect(() => {
        const loader = new GLTFLoader();
        loader.load(livingRoom, (gltf) => {
            setGltfScene(gltf.scene);
        });
    }, []);

    useEffect(() => {
        if (!gltfScene) return;

        gltfScene.traverse((child) => {
            if (child.isMesh && child.name === "바닥") {
                const mesh = child as THREE.Mesh;

                // 원본 재질 복제
                const origMat = mesh.material as THREE.MeshStandardMaterial;
                const clonedMat = origMat.clone();

                // 텍스처 로드
                const texture1 = new THREE.TextureLoader().load(image1);
                const texture2 = new THREE.TextureLoader().load(image2);

                // 텍스처 설정
                texture1.flipY = false;
                texture2.flipY = false;

                // 초기 렌더링용 lightMap 설정
                clonedMat.lightMap = texture2;
                clonedMat.lightMap.channel = 1;
                clonedMat.lightMapIntensity = 1;

                // 메시에 재질 적용
                mesh.material = clonedMat;

                // 쉐이더 수정
                clonedMat.onBeforeCompile = (shader) => {
                    // 유니폼 변수 설정
                    shader.uniforms.progress = { value: progressRef.current.value };
                    shader.uniforms.texture1 = { value: texture1 };
                    shader.uniforms.texture2 = { value: texture2 };
                    shader.uniforms.lightMapStrength = { value: 0.1 };

                    // 프래그먼트 쉐이더에 유니폼 변수 추가
                    shader.fragmentShader = `
                      uniform float progress;
                      uniform sampler2D texture1;
                      uniform sampler2D texture2;
                      uniform float lightMapStrength;
                    ` + shader.fragmentShader;

                    // lights_fragment_maps 부분 완전히 대체 (중요: 기존 lightMap 계산 무시)
                    shader.fragmentShader = shader.fragmentShader.replace(
                        '#include <lights_fragment_maps>',
                        `
                        #ifdef USE_LIGHTMAP
                            // 기존 lightMap 계산은 무시하고 새로 계산
                            vec4 lightMap1 = texture2D(texture1, vLightMapUv);
                            vec4 lightMap2 = texture2D(texture2, vLightMapUv);
                            vec4 mixedLightMap = mix(lightMap1, lightMap2, progress);
                            reflectedLight.indirectDiffuse += mixedLightMap.rgb*lightMapStrength;
                        #endif
                            #include <lights_fragment_maps>
                        `
                    );

                    // 쉐이더 참조 저장
                    clonedMat.shader = shader;
                }

                // 재질 적용
                child.material = clonedMat;
            } else if (
                child.isMesh && child.parent.name === "거실DP"
            ) {
                const mesh = child as THREE.Mesh;

                // 원본 재질 복제
                const origMat = mesh.material as THREE.MeshStandardMaterial;
                const clonedMat = origMat.clone();
                const texture1 = new THREE.TextureLoader().load(image3);

                texture1.flipY = false;
                clonedMat.transparent = true
                clonedMat.lightMap = texture1;
                clonedMat.lightMap.channel = 1;
                clonedMat.lightMapIntensity = 1;
                mesh.material = clonedMat;

            }
        });
    }, [gltfScene]);

    useEffect(() => {
        let foundMesh: THREE.Mesh | null = null;
        let DpMeshes: THREE.Mesh[] = []

        scene.traverse((child) => {
            if (child.isMesh && child.name === "바닥") {
                foundMesh = child;
            } else if (child.isMesh && child.parent.name === "거실DP") {
                DpMeshes.push(child)
            }
        });
        if (!foundMesh) return
        if (DpMeshes.length > 1) {

            gsap.to(DpMeshes.map(child => child.material), {
                opacity: isClick ? 0 : 1,
                duration: 2,
                ease: "power1.inOut",
                onStart: function () {
                    console.log("start");
                },
                onUpdate: function () {
                    DpMeshes.forEach(child => {
                        if (!child.material) return;

                        if (isClick && child.material.opacity < 0.05) {
                            child.visible = false;
                        }
                        if (!isClick && child.material.opacity > 0.05) {
                            child.visible = true;
                        }
                    });
                },
                onComplete: function () {
                    DpMeshes.forEach(child => {
                        if (!child.material) return
                        if (isClick) {
                            child.visible = false;
                        } else {
                            child.visible = true;
                        }
                    });
                }
            });
        }

        if (foundMesh) {
            console.log("DpMeshes", DpMeshes)
            // foundMesh가 있을 때만 애니메이션 실행
            gsap.to(progressRef.current, {
                value: isClick ? 1 : 0,
                duration: 2,
                ease: "power1.inOut",
                onStart: function () {
                    console.log("start")
                },
                onUpdate: function () {

                    foundMesh.material.shader.uniforms.progress.value = progressRef.current.value
                },
                onComplete: function () {
                    console.log("  foundMesh.material", foundMesh.material)
                }
            });
        }

    }, [isClick]);

    return gltfScene ? <primitive object={gltfScene} /> : null;
}

export default CheckPBRShader