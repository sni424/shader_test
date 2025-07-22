import React, { useEffect, useMemo, useRef, useState } from "react";
import { EffectComposer, GLTF, GLTFLoader, RenderPass, ShaderPass } from "three/examples/jsm/Addons.js";
import { LoadModelResult, ModelScene } from "./CheckDimensions";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import 침실all from "/침실2_base.glb?url"

interface ShaderUniforms {
  tDiffuse: { value: THREE.Texture | null };
  resolution: { value: THREE.Vector2 };
  strength: { value: number };
  opacity: { value: number };
}

// 이유: 샤프닝 셰이더 정의
// 결과: 최적화된 샤프닝 및 블렌딩 효과
const mainShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2() },
    strength: { value: 0.33 },
    opacity: { value: 1.0 },
    isSharpen: { value: true },
  } as ShaderUniforms,
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
  #define GAMMA_FACTOR 2.2
    uniform mediump sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float strength;
    uniform float opacity;
    uniform bool isSharpen;
    varying vec2 vUv;

       // 이유: 선형 색상을 감마 색상 공간으로 변환
      // 결과: 감마 보정된 색상 반환
      vec4 LinearToGamma(vec4 value, float gammaFactor) {
        return vec4(pow(value.rgb, vec3(1.0 / gammaFactor)), value.a);
      }

      // 이유: 출력 텍셀을 감마 보정
      // 결과: 선형 → sRGB 출력
      vec4 linearToOutputTexel2(vec4 value) {
        return LinearToGamma(value, float(GAMMA_FACTOR));
      }

    // 이유: 샤프닝 효과 적용
    // 결과: 텍스처 선명도 조절, 클램핑 포함
    void e0MainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
      vec2 fragCoord = uv * resolution;
      float neighbor = strength * -1.0;
      float center = strength * 4.0 + 1.0;
      vec3 color = inputColor.rgb * center
        + texture2D(tDiffuse, (fragCoord + vec2(1.0, 0.0)) / resolution).rgb * neighbor
        + texture2D(tDiffuse, (fragCoord + vec2(-1.0, 0.0)) / resolution).rgb * neighbor
        + texture2D(tDiffuse, (fragCoord + vec2(0.0, 1.0)) / resolution).rgb * neighbor
        + texture2D(tDiffuse, (fragCoord + vec2(0.0, -1.0)) / resolution).rgb * neighbor;
      outputColor = vec4(clamp(color, 0.0, 1.0), inputColor.a);
    }

    // 이유: 원본과 샤프닝 결과를 혼합
    // 결과: opacity에 따라 자연스러운 샤프닝 효과
    vec4 blend23(const in vec4 x, const in vec4 y, const in float opacity) {
      return mix(x, y, opacity);
    }

    // 이유: 프래그먼트 셰이더 진입점
    // 결과: 샤프닝 및 블렌딩 적용
    void main() {
      vec4 color0 = texture2D(tDiffuse, vUv); // sRGB 입력
           vec4 color1 = vec4(0.0);
      if (strength > 0.0 && opacity > 0.0 && isSharpen) {
   
        e0MainImage(color0, vUv, color1);
        color0 = blend23(color0, color1, 1.0);
   
   
      }
      gl_FragColor = linearToOutputTexel2( color0 );
    }
  `,
};


const modelArray = [침실all];
const loader = new GLTFLoader();

const loadModels = async (modelArray: string[]): Promise<LoadModelResult> => {
  const loadPromises = modelArray.map(
    (url: string) =>
      new Promise<ModelScene>((resolve, reject) => {
        loader.load(
          url,
          (gltf: GLTF) => resolve(gltf.scene),
          undefined,
          (event: ErrorEvent) => {
            console.error("GLTF 로드 에러:", event);
            reject(event);
          }
        );
      })
  );
  return await Promise.all(loadPromises);
};

type CheckSharpenProps = {
  strength: number
  opacity: number
}

const CheckSharpen = ({ strength, opacity }: CheckSharpenProps) => {
  const { gl, scene, size, camera } = useThree();
  const [isModelAdd, setModelAdd] = useState(false);

  const mainPassRef = useRef<ShaderPass | null>(null);
  const pixelRatio = Math.min(window.devicePixelRatio, 1.2);
  const isLowPerformance = /Mobi|Android/i.test(navigator.userAgent); // 간단한 모바일 감지

  const composer = useMemo(() => {
    const renderTarget = new THREE.WebGLRenderTarget(
      size.width * pixelRatio,
      size.height * pixelRatio,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        type: THREE.UnsignedByteType,
        samples: 0, // MSAA 비활성화
        generateMipmaps: false, // 밉맵 비활성화 (고해상도 디테일 유지)
        depthBuffer: true, // 깊이 버퍼 비활성화
        stencilBuffer: false, // 스텐실 버퍼 비활성화
      },
    );
    // 이유: EffectComposer 설정
    // 결과: 단일 패스 후처리 파이프라인
    const composer = new EffectComposer(gl, renderTarget);
    composer.addPass(new RenderPass(scene, camera));

    // 이유: 메인 패스 추가
    // 결과: 샤프닝 효과 적용
    const mainPass = new ShaderPass(mainShader);
    mainPass.uniforms.resolution.value.set(size.width, size.height);

    mainPassRef.current = mainPass;
    composer.addPass(mainPass);

    return composer;
  }, [gl, size, scene, camera]);


  // 모델 로드
  useEffect(() => {
    if (!isModelAdd && scene) {
      gl.toneMapping = THREE.AgXToneMapping;
      gl.outputColorSpace = THREE.SRGBColorSpace; // 출력 색상 공간 명시
      loadModels(modelArray).then((res) => {
        res.forEach((child) => scene.add(child));
        setModelAdd(true);
      });
    }
  }, [scene, isModelAdd]);


  useFrame(() => {
    if (mainPassRef.current) {
      mainPassRef.current.uniforms.strength.value = 0.33;

      mainPassRef.current.uniforms.opacity.value = 1.0;
      mainPassRef.current.uniforms.opacity.value = true;
    }
    composer.render();
  }, 1);


  // UI 컨트롤 추가
  return null
};

export default CheckSharpen;