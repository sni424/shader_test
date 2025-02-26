import { useEffect, useRef, useState } from 'react'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import floor from "/floor.glb?url"
import livingRoom from "/livingRoom.glb?url"
import livingWithkitchen from "/livingWithkitchen.glb?url"
import * as THREE from "three"

import image1 from "/dpOn.jpg?url"
import image2 from "/dpOff.jpg?url"
import image3 from "/dpLightMap.jpg?url"
import gsap from 'gsap';
import { useThree } from '@react-three/fiber'

const DpMeshes: THREE.Mesh[] = []
let floorMesh: THREE.Mesh | null = null;
const bespoke: THREE.Mesh[] = []
const kitchen: THREE.Mesh[] = []

const CheckPBRShader = ({ isClick }: { isClick: boolean }) => {
    const { scene } = useThree()
    const [gltfScene, setGltfScene] = useState<THREE.Group | null>(null);
    const progressRef = useRef({ value: isClick ? 1 : 0 });


    useEffect(() => {
        const loader = new GLTFLoader();
        loader.load(livingWithkitchen, (gltf) => {
            setGltfScene(gltf.scene);
        });
    }, []);

    useEffect(() => {
        if (!gltfScene) return;

        gltfScene.traverse((child) => {
            if (child.isMesh && child.name === "바닥") {
                const mesh = child as THREE.Mesh;
                floorMesh = child
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
                    shader.uniforms.lightMapStrength = { value: 1 };

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
                DpMeshes.push(child)
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
            else if (
                child.isMesh && child.parent.name === "bespoke통합glb" || child.isMesh && child.parent.name === "sink001"
            ) {
                const mesh = child as THREE.Mesh;
                bespoke.push(child)
                // 원본 재질 복제
                const origMat = mesh.material as THREE.MeshStandardMaterial;
                const clonedMat = origMat.clone();
                clonedMat.transparent = true
                clonedMat.opacity = 0
                mesh.visible = false
                mesh.material = clonedMat;

            }

            else if (
                child.isMesh && child.parent.name === "주방base"
            ) {
                const mesh = child as THREE.Mesh;
                kitchen.push(child)
                // 원본 재질 복제
                const origMat = mesh.material as THREE.MeshStandardMaterial;
                const clonedMat = origMat.clone();
                clonedMat.transparent = true
                clonedMat.side = THREE.DoubleSide

                mesh.material = clonedMat;

            }
        });
    }, [gltfScene]);

    useEffect(() => {


        if (!floorMesh) return
        if (kitchen.length > 0) {
            gsap.to(kitchen.map(child => child.material), {
                opacity: isClick ? 0 : 1,
                duration: 2,
                ease: "power1.inOut",
                onStart: function () {
                    kitchen.forEach(child => {
                        if (!isClick) {
                            child.visible = true;
                        }
                    });
                },
                onUpdate: function () {

                },
                onComplete: function () {
                    bespoke.forEach(child => {
                        if (!child.material) return
                        if (!isClick) {
                            child.visible = true;
                        } else {
                            child.visible = false;
                        }
                    });
                }
            });
        }
        if (bespoke.length > 0) {
            gsap.to(bespoke.map(child => child.material), {
                opacity: isClick ? 1 : 0,
                duration: 2,
                ease: "power1.inOut",
                onStart: function () {
                    bespoke.forEach(child => {

                        if (isClick) {
                            child.visible = true;
                        }
                    });
                },
                onUpdate: function () {

                },
                onComplete: function () {
                    bespoke.forEach(child => {
                        if (!child.material) return
                        if (isClick) {
                            child.visible = true;
                        } else {
                            child.visible = false;
                        }
                    });
                }
            });
        }
        if (DpMeshes.length > 0) {

            gsap.to(DpMeshes.map(child => child.material), {
                opacity: isClick ? 0 : 1,
                duration: 2,
                ease: "power1.inOut",
                onStart: function () {
                    DpMeshes.forEach(child => {

                        if (!isClick) {
                            child.visible = true;
                        }
                    });
                },
                onUpdate: function () {

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

        if (floorMesh) {
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

                    floorMesh.material.shader.uniforms.progress.value = progressRef.current.value
                },
                onComplete: function () {
                    console.log("  foundMesh.material", floorMesh.material)
                }
            });
        }

    }, [isClick]);

    return gltfScene ? <primitive object={gltfScene} /> : null;
}

export default CheckPBRShader