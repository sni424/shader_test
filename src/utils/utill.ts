import * as THREE from "three";
import { basicSettingAtom, getAtomValue } from "./atom";

// 카메라 회전 및 각도 제한
export const clampAndUpdateCamera = (
  camera: THREE.PerspectiveCamera,
  maxPitchDeg: number,
  xAngle: number,
  yAngle: number,
  interpolationFactor: number = 0.7
): void => {
  // 1. X축 회전 (yaw)를 위한 쿼터니언 생성 (Y축 기준 회전)
  const quaternionX = new THREE.Quaternion();
  quaternionX.setFromAxisAngle(new THREE.Vector3(0, 1, 0), xAngle);

  // 2. Y축 회전 (pitch)를 위한 쿼터니언 생성 (X축 기준 회전)
  const quaternionY = new THREE.Quaternion();
  quaternionY.setFromAxisAngle(new THREE.Vector3(1, 0, 0), yAngle);

  // 3. 현재 카메라의 쿼터니언을 복제하여 목표 쿼터니언 생성
  const targetQuaternion = camera.quaternion.clone();

  // 4. 목표 쿼터니언에 X축 회전 적용
  targetQuaternion.multiply(quaternionX);
  // 5. 목표 쿼터니언에 Y축 회전 적용
  targetQuaternion.multiply(quaternionY);

  // 6. 목표 쿼터니언을 Euler 각도로 변환 (회전 순서: 'YXZ')
  const euler = new THREE.Euler().setFromQuaternion(targetQuaternion, "YXZ");
  // 7. 최대 피치 각도를 라디안으로 변환
  const maxPitch = THREE.MathUtils.degToRad(maxPitchDeg);
  // 8. 피치(euler.x)를 -maxPitch ~ maxPitch 범위로 제한
  euler.x = THREE.MathUtils.clamp(euler.x, -maxPitch, maxPitch);
  // 9. 롤(회전, euler.z)은 제거하여 화면 기울임 방지
  euler.z = 0;
  // 10. 제한된 Euler 각도를 기반으로 목표 쿼터니언 업데이트 및 정규화
  targetQuaternion.setFromEuler(euler);
  targetQuaternion.normalize();

  // 11. 현재 카메라 쿼터니언을 목표 쿼터니언으로 부드럽게 보간(slerp)
  camera.quaternion.slerp(targetQuaternion, interpolationFactor);
  // 12. 변경된 쿼터니언을 반영하기 위해 카메라 월드 행렬 업데이트
  camera.updateMatrixWorld(true);
};

/**
 * 충돌 감지와 함께 카메라 위치 업데이트
 *
 * @param movement - 제안된 이동 벡터
 */
export const tryCameraMove = (
  movement: THREE.Vector3,
  camera: THREE.PerspectiveCamera
): boolean => {
  const possibleMoves = [
    {
      move: camera.position.clone().add(movement),
      description: "전체 이동",
    },
    {
      move: camera.position.clone().add({ x: 0, y: 0, z: movement.z }),
      description: "Z축 이동",
    },
    {
      move: camera.position.clone().add({ x: movement.x, y: 0, z: 0 }),
      description: "X축 이동",
    },
  ];

  for (const { move } of possibleMoves) {
    camera.position.copy(move);
    camera.updateProjectionMatrix();

    return true;

    // console.log('bool', bool);
    // if (isCameraAboveFloor(move, navMesh.current)) {
    //   camera.position.copy(move);
    //   camera.updateProjectionMatrix();
    //   updateCameraInfo();
    //   return true;
    // }
  }

  return false;
};

//초기 세팅 카메라 및 배경경
export function resetToInitialView(
  camera: THREE.PerspectiveCamera,
  gl: THREE.WebGLRenderer
) {
  const { camera: cameraSetting } = getAtomValue(basicSettingAtom);
  if (cameraSetting.matrix && cameraSetting.matrix.length === 16) {
    const matrix = new THREE.Matrix4().fromArray(cameraSetting.matrix);
    matrix.decompose(camera.position, camera.quaternion, camera.scale);
    camera.fov = cameraSetting.fov;
    camera.updateMatrixWorld(true);
  } else {
    console.error("Invalid camera matrix data:", cameraSetting.matrix);
  }

  gl.setClearColor(0x000000, 1);
}

// 캔버스에서 클릭한 이벤트만
export const getCanvasTouch = (
  touches: TouchList | MouseEvent
): Touch | undefined => {
  if (touches instanceof TouchList) {
    return Array.from(touches).find(
      (touch) =>
        (touch.target as HTMLElement).tagName.toLowerCase() === "canvas"
    );
  } else {
    return (touches.target as HTMLElement).tagName.toLowerCase() === "canvas"
      ? (touches as unknown as Touch)
      : undefined;
  }
};
