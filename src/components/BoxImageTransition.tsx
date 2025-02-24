import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import image1 from "/image1.jpg?url"
import image2 from "/image2.png?url"
import gsap from "gsap";

const BoxImageTransition = ({ isClick }: { isClick: boolean }) => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { size, invalidate } = useThree();
    const textures = useTexture([image1, image2]);

    // progress 상태를 GSAP tween으로 업데이트합니다.
    // material 재생성 없이, uniform 업데이트만 반영하도록 합니다.
    const [progress, setProgress] = useState(isClick ? 1 : 0);
    useEffect(() => {
        gsap.to({ t: progress }, {
            t: isClick ? 1 : 0,
            duration: 2,
            ease: "power1.inOut",
            onUpdate: function () {
                setProgress(this.targets()[0].t);
            }
        });
    }, [isClick]);


    // ShaderMaterial을 한 번만 생성합니다.
    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                progress: { value: 0 },
                texture1: { value: textures[0] },
                texture2: { value: textures[1] },
                resolution: { value: new THREE.Vector4(size.width, size.height, 1, 1) }
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
        uniform vec4 resolution;
        varying vec2 vUv;
        void main() {
          gl_FragColor = mix(texture2D(texture1, vUv), texture2D(texture2, vUv), progress);
        }
      `,
            transparent: true
        });
    }, [textures, size]);


    useFrame(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.progress.value = progress;
            materialRef.current.needsUpdate = true;
            invalidate();
        }
    });

    return (
        <mesh>
            <boxGeometry args={[10, 10, 10]} />
            {/* 이미 생성된 ShaderMaterial을 primitive로 사용 */}

            <primitive object={shaderMaterial} ref={materialRef} attach="material" />
        </mesh>
    );
}


export default BoxImageTransition


// function ImageTransition({ isClick }: { isClick: boolean }) {
//   const materialRef = useRef<THREE.ShaderMaterial>(null);
//   const { size, invalidate } = useThree();
//   const textures = useTexture([image1, image2]);

//   // progress 상태를 GSAP tween으로 업데이트합니다.
//   // material 재생성 없이, uniform 업데이트만 반영하도록 합니다.
//   const [progress, setProgress] = useState(isClick ? 1 : 0);
//   useEffect(() => {
//     gsap.to({ t: progress }, {
//       t: isClick ? 1 : 0,
//       duration: 2,
//       ease: "power1.inOut",
//       onUpdate: function () {
//         setProgress(this.targets()[0].t);
//       }
//     });
//   }, [isClick]);

//   // ShaderMaterial을 한 번만 생성합니다.
//   const shaderMaterial = useMemo(() => {
//     return new THREE.ShaderMaterial({
//       uniforms: {
//         progress: { value: progress },
//         texture1: { value: textures[0] },
//         texture2: { value: textures[1] },
//         resolution: { value: new THREE.Vector4(size.width, size.height, 1, 1) }
//       },
//       vertexShader: `
//         varying vec2 vUv;
//         void main() {
//           vUv = uv;
//           gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//         }
//       `,
//       fragmentShader: `
//         uniform float progress;
//         uniform sampler2D texture1;
//         uniform sampler2D texture2;
//         uniform vec4 resolution;
//         varying vec2 vUv;
//         void main() {
//           // progress 값에 따라 두 텍스처를 선형 보간합니다.
//           gl_FragColor = mix(texture2D(texture1, vUv), texture2D(texture2, vUv), progress);
//         }
//       `,
//       transparent: true
//     });
//   }, [textures, size]);

//   // 매 프레임마다 shader의 uniform을 업데이트하고 invalidate()를 호출합니다.
//   useFrame(() => {
//     if (materialRef.current) {
//       materialRef.current.uniforms.progress.value = progress;
//       materialRef.current.needsUpdate = true;
//       // invalidate()를 호출하면 렌더링을 강제로 갱신합니다.
//       invalidate();
//     }
//   });

//   return (
//     <mesh>
//       <planeGeometry args={[10, 10]} />
//       {/* 이미 생성된 ShaderMaterial을 primitive로 사용 */}
//       <primitive object={shaderMaterial} ref={materialRef} attach="material" />
//     </mesh>
//   );
// }

// function ImageTransition({ isClick }: { isClick: boolean }) {
//   const materialRef = useRef<THREE.ShaderMaterial>(null);
//   const { size } = useThree();
//   const textures = useTexture([image1, image2]);

//   useEffect(() => {
//     if (materialRef.current && isClick) {
//       gsap.to({ t: 0 }, {
//         t: 1,
//         duration: 2,
//         ease: "power1.inOut",
//         onUpdate: function () {
//           const progress = this.targets()[0].t;
//           if (materialRef.current) {

//             materialRef.current.uniforms.progress.value = progress;

//           }
//         }
//       });
//     }
//   }, [isClick]);

//   return (
//     <mesh>
//       <boxGeometry args={[10, 10, 10]} />
//       <shaderMaterial
//         ref={materialRef}
//         uniforms={{
//           progress: { value: 0 },
//           texture1: { value: textures[0] },
//           texture2: { value: textures[1] },
//           resolution: { value: new THREE.Vector4(size.width, size.height, 1, 1) }
//         }}
//         vertexShader={`
//           varying vec2 vUv;
//           void main() {
//             vUv = uv;
//             gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//           }
//         `}
//         fragmentShader={`
//           uniform float progress;
//           uniform sampler2D texture1;
//           uniform sampler2D texture2;
//           uniform vec4 resolution;
//           varying vec2 vUv;
//           void main() {
//                     gl_FragColor = vec4(progress, 0.0, 0.0, 1.0);
//           }
//         `}
//         transparent={true}
//       />
//     </mesh>
//   );
// }


// Vertex Shader (정점 셰이더)
// vUv: 프래그먼트 셰이더로 전달할 UV 좌표
// 내장된 uv 속성을 vUv에 할당하여 프래그먼트 셰이더로 전달합니다.
// 모델, 뷰, 프로젝션 행렬을 사용해 최종 정점 위치를 계산합니다.
// Three.js와 WebGL 파이프라인에서는 몇 가지 내장 변수와 내장 행렬이 자동으로 제공됩니다.

// projectionMatrix와 modelViewMatrix

// 이 두 행렬은 Three.js가 렌더링할 때 자동으로 셰이더에 전달하는 내장 uniform입니다.
// modelViewMatrix는 객체의 로컬 좌표계를 카메라 좌표계로 변환하는 행렬이며,
// projectionMatrix는 카메라 좌표계를 클립 공간으로 변환하는 행렬입니다.
// 즉, 이 두 행렬을 곱하면 정점의 로컬 좌표가 화면에 올바르게 표시될 수 있도록 변환됩니다.
// gl_Position

// 이는 vertex shader에서 계산된 최종 정점 위치를 저장하는 내장 변수입니다.
// GPU 파이프라인에서 이 값을 사용해 정점을 클리핑하고, 화면상의 위치를 결정합니다.
// 코드 상에서 직접 보이지 않더라도, 이 변수는 반드시 설정되어야 하며, 그 결과가 GPU에 의해 사용됩니다.
// 요약하면,

// projectionMatrix와 modelViewMatrix는 Three.js 렌더러가 자동으로 전달하는 행렬이고,
// gl_Position은 이 행렬들을 사용해 계산된 결과로, GPU가 정점의 위치를 결정하는 데 사용됩니다.
// vUv: 정점 셰이더에서 계산되어 프래그먼트 셰이더로 전달되는 UV 좌표입니다.
// gl_Position: 정점 셰이더에서 계산한 최종 정점 위치로, 화면에 렌더링될 때 사용됩니다.

// Fragment Shader (프래그먼트 셰이더)

// Uniform 변수: 자바스크립트에서 설정하는 값들
// uniform float time;            // 경과 시간 (애니메이션에 사용 가능)
// uniform float progress;        // 전환 진행 정도 (0.0 ~ 1.0)
// uniform sampler2D texture1;    // 첫 번째 텍스처
// uniform sampler2D texture2;    // 두 번째 텍스처
// uniform vec4 resolution;       // 해상도 벡터 (예: width, height 등)

// // vUv: 버텍스 셰이더에서 전달받은 UV 좌표
// varying vec2 vUv;

// // 해시 함수: 입력 벡터 p를 기반으로 의사 난수 값을 생성합니다.
// float hash(vec2 p) {
//   return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
// }

// // hnoise: 주변 그리드 포인트의 해시 값을 부드럽게 보간하여 노이즈를 생성합니다.
// float hnoise(vec2 x) {
//   vec2 i = floor(x);        // x의 정수 부분 (그리드 셀 좌표)
//   vec2 f = fract(x);        // x의 소수 부분 (셀 내 위치)

//   // 그리드 셀의 네 꼭짓점에서 해시 값을 계산합니다.
//   float a = hash(i);
//   float b = hash(i + vec2(1.0, 0.0));
//   float c = hash(i + vec2(0.0, 1.0));
//   float d = hash(i + vec2(1.0, 1.0));

//   // 부드러운 보간을 위한 가중치를 계산 (헤르밋 곡선 사용)
//   vec2 u = f * f * (3.0 - 2.0 * f);
//   // 네 꼭짓점의 해시 값을 보간하여 부드러운 노이즈 값을 반환합니다.
//   return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
// }

// void main() {
//   // UV 좌표를 중앙(0.5, 0.5) 기준으로 재조정하고 해상도에 맞게 스케일합니다.
//   vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
//   // newUV 좌표를 기반으로 100으로 나눈 값으로 노이즈를 생성합니다.
//   float hn = hnoise(newUV.xy * resolution.xy / 100.0);
//   // 중앙을 향하는 방향의 y값만 사용하는 오프셋 벡터를 계산합니다.
//   vec2 d = vec2(0.0, normalize(vec2(0.5, 0.5) - newUV.xy).y);
//   // 첫 번째 텍스처의 UV 오프셋: progress와 노이즈 값을 이용해 이동
//   vec2 uv1 = newUV + d * progress / 5.0 * (1.0 + hn / 2.0);
//   // 두 번째 텍스처의 UV 오프셋: 반대 방향으로 이동
//   vec2 uv2 = newUV - d * (1.0 - progress) / 5.0 * (1.0 + hn / 2.0);
//   // 각 텍스처에서 색상을 샘플링합니다.
//   vec4 t1 = texture2D(texture1, uv1);
//   vec4 t2 = texture2D(texture2, uv2);
//   // progress 값에 따라 두 텍스처의 색상을 혼합하여 최종 색상을 결정합니다.
//   gl_FragColor = mix(t1, t2, progress);
// }
// gl_FragColor는 프래그먼트 셰이더에서 계산한 최종 픽셀(프래그먼트)의 색상을 나타내는 내장 변수.
// 즉, 이 변수에 설정된 값이 화면에 그 픽셀의 색상으로 출력


// fragmentShader={`
//   uniform float time;
//   uniform float progress;
//   uniform sampler2D texture1;
//   uniform sampler2D texture2;
//   uniform vec4 resolution;
//   varying vec2 vUv;

//   float hash(vec2 p) {
//     return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
//   }

//   float hnoise(vec2 x) {
//     vec2 i = floor(x);
//     vec2 f = fract(x);
//     float a = hash(i);
//     float b = hash(i + vec2(1.0, 0.0));
//     float c = hash(i + vec2(0.0, 1.0));
//     float d = hash(i + vec2(1.0, 1.0));
//     vec2 u = f * f * (3.0 - 2.0 * f);
//     return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
//   }

//   void main() {
//     vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
//     float hn = hnoise(newUV.xy * resolution.xy / 100.0);
//     vec2 d = vec2(0., normalize(vec2(0.5, 0.5) - newUV.xy).y);
//     vec2 uv1 = newUV + d * progress / 5.0 * (1.0 + hn / 2.0);
//     vec2 uv2 = newUV - d * (1.0 - progress) / 5.0 * (1.0 + hn / 2.0);
//     vec4 t1 = texture2D(texture1, uv1);
//     vec4 t2 = texture2D(texture2, uv2);
//     gl_FragColor = mix(t1, t2, progress);
//   }
// `}