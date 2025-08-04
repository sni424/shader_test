import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react'
import * as THREE from "three"
import { basicSettingAtom, getAtomValue, modelAtom } from '../../../utils/atom';
import { clampAndUpdateCamera, getCanvasTouch, tryCameraMove } from '../../../utils/utill';

interface CameraState {
    isRotating: boolean;
    isDragging: boolean;
    previousTouchPosition: { x: number; y: number };
    deltaVector: { x: number; y: number };
    rotationVelocity: { x: number; y: number };
    moveVelocity: number;
    prevTapTime: number;
    prevFrameTime: number;
    doubleTap: boolean;
    doubleTouch: boolean;
    animationFrameId: number | null;
}


const MobileCameraManager = () => {
    const { camera, pointer } = useThree();

    const cameraState = useRef<CameraState>({
        //터치가 시작되어 회전 제스처가 활성화되었는지 여부
        isRotating: false,
        //실제로 일정 거리 이상 이동(드래그)했는지
        isDragging: false,
        //이전 마우스 위치
        previousTouchPosition: { x: 0, y: 0 },
        //카메라 이동할 위치치
        deltaVector: { x: 0, y: 0 },
        //회전 가속도
        rotationVelocity: { x: 0, y: 0 },
        moveVelocity: 0,
        //이전 터치
        prevTapTime: 0,
        prevFrameTime: 0,
        //더블클릭인지 아닌지
        doubleTap: false,
        doubleTouch: false,
        animationFrameId: null,
    });
    const timerIdRef = useRef<number | null>(null);
    const { camera: cameraSetting } = getAtomValue(basicSettingAtom);

    const animateTouchMove = (currentTime: number) => {
        if (!cameraState.current.deltaVector) return;

        let { x: deltaX, y: deltaY } = cameraState.current.deltaVector;
        const len = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // 너무 작으면 이동 생략
        if (len < 0.5) {
            cameraState.current.deltaVector = { x: 0, y: 0 };
            cameraState.current.animationFrameId = null;
            return;
        }

        //  방향 유지
        const normX = deltaX / len;
        const normY = deltaY / len;

        // 감도 보정
        // 너무 작을 때 제한한
        const minSpeed = 0.3;
        // 너무 빠를 때 제한
        const maxSpeed = 1;

        // 이동 속도 계산: len 기반으로 선형 보간
        // 예: len이 0.3~20 사이일 때 속도 0.3~1.5 사이로 선형 증가
        const speed = Math.min(maxSpeed, Math.max(minSpeed, (len / 20) * maxSpeed));

        //민감도
        const sensitivity = 0.05;

        // 4. 스케일링된 delta 사용
        deltaX = normX * speed * sensitivity;
        deltaY = normY * speed * sensitivity;

        const deltaTime = cameraState.current.prevFrameTime
            ? (currentTime - cameraState.current.prevFrameTime) / 1000
            : 0;
        cameraState.current.prevFrameTime = currentTime;
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, camera.up).normalize();
        const moveVector = new THREE.Vector3();

        if (cameraState.current.doubleTouch) {
            cameraState.current.moveVelocity = 1.0;
        } else if (cameraState.current.moveVelocity > 0) {
            cameraState.current.moveVelocity = Math.max(
                0,
                cameraState.current.moveVelocity - 2.5 * deltaTime,
            );
        }

        moveVector
            .set(0, 0, 0)
            .addScaledVector(right, -deltaX * cameraState.current.moveVelocity)
            .addScaledVector(forward, deltaY * cameraState.current.moveVelocity);
        tryCameraMove(moveVector, camera as THREE.PerspectiveCamera);

        if (
            cameraState.current.doubleTouch ||
            cameraState.current.moveVelocity > 0
        ) {
            cameraState.current.animationFrameId = requestAnimationFrame(t =>
                animateTouchMove(t),
            );
        } else {
            cameraState.current.animationFrameId = null;
        }
    };

    // 카메라 회전 함수수
    const moveCameraRotation = (deltaX: number, deltaY: number): void => {
        const sensitivity = cameraSetting.rotationSpeed;

        //  부드럽게
        cameraState.current.rotationVelocity.x =
            cameraState.current.rotationVelocity.x * 0.8 +
            deltaX * sensitivity * 0.0008;
        cameraState.current.rotationVelocity.y =
            cameraState.current.rotationVelocity.y * 0.8 +
            deltaY * sensitivity * 0.0008;

        // 회전 적용
        clampAndUpdateCamera(
            camera as THREE.PerspectiveCamera,
            50,
            -cameraState.current.rotationVelocity.x,
            -cameraState.current.rotationVelocity.y,
        );
    };
    // 회전 끝난 후 관성 추가가
    const applyInertia = (): void => {
        if (
            !cameraState.current.isRotating &&
            !cameraState.current.doubleTap &&
            (Math.abs(cameraState.current.rotationVelocity.x) > 0.001 ||
                Math.abs(cameraState.current.rotationVelocity.y) > 0.001)
        ) {
            // 더 부드러운 감속
            const inertiaFactor = Math.max(0.9, cameraSetting.inertia);

            cameraState.current.rotationVelocity.x *= inertiaFactor;
            cameraState.current.rotationVelocity.y *= inertiaFactor;
            clampAndUpdateCamera(
                camera as THREE.PerspectiveCamera,
                50,
                -cameraState.current.rotationVelocity.x / 1.1,
                -cameraState.current.rotationVelocity.y / 1.1,
            );

            requestAnimationFrame(applyInertia);
        }
    };

    //   // 두번 터치됬을때 카메라 이동
    //   const handleDoubleClick = (e: TouchEvent) => {
    //     const canvasTouch = getCanvasTouch(e.changedTouches);
    //     if (!canvasTouch) return;
    //     const raycaster = new THREE.Raycaster();
    //     raycaster.setFromCamera(pointer, camera);
    //     const model = getAtomValue(modelAtom);

    //     if (!model) {
    //       throw new Error('no model');
    //     }
    //     const filterChildren = model.children.filter((child:THREE.Object3D) => {
    //       return !child.name.includes('probe');
    //     });
    //     const intersects = raycaster.intersectObjects(filterChildren, true);
    //     if (!intersects.length) return;

    //     let object;
    //     if (intersects[0].object.name === 'mousePointerMesh') {
    //       object = intersects[1];
    //     } else {
    //       object = intersects[0];
    //     }
    //     const { point: targetPoint, normal: targetNormal } = object;
    //     if (targetNormal) {
    //     //   const newPointTarget = targetPoint
    //     //     .clone()
    //     //     .add(
    //     //       new THREE.Vector3(
    //     //         targetNormal.x,
    //     //         targetNormal.y,
    //     //         targetNormal.z,
    //     //       ).multiplyScalar(0.01),
    //     //     );
    //     //   setAtomValue(pointMarkerAtom, {
    //     //     position: newPointTarget,
    //     //     normal: targetNormal,
    //     //     on: true,
    //     //   });
    //     }
    //     if (targetNormal) {
    //       targetPoint.add(
    //         new THREE.Vector3(
    //           targetNormal.x,
    //           targetNormal.y,
    //           targetNormal.z,
    //         ).multiplyScalar(0.5),
    //       );
    //     }
    //     const rotationMatrix = new THREE.Matrix4().extractRotation(camera.matrix);
    //     const targetMatrix = new THREE.Matrix4()
    //       .makeTranslation(targetPoint.x, cameraSetting.matrix[13], targetPoint.z)
    //       .multiply(rotationMatrix);
    //     camera.moveTo({ linear: { stopAnimation: true } });
    //     camera.moveTo({
    //       linear: {
    //         matrix: targetMatrix.toArray(),
    //         animationType: 'power2.out',
    //         duration: object.distance,
    //         isQuaternion: false,
    //       },
    //       onComplete: () => {
    //         // updateCameraInfo(camera as THREE.PerspectiveCamera);
    //         cameraState.current.doubleTap = false;
    //       },
    //     });
    //   };


    // 한번만 터치했을때 카메라 시점변
    let quaternionAnimation: gsap.core.Tween | null = null;
    let canvasTouch;
    const handleSingleClick = (
        event: TouchEvent | MouseEvent,
        pointer: THREE.Vector2,
        camera: THREE.PerspectiveCamera,
        isDrag: boolean,
        doubleTap: boolean,
    ) => {
        //   const cameraAction = getAtomValue(cameraActionAtom);
        //움직이고 있을때
        //   if (cameraAction.pathFinding.isAnimation) return;
        if ('changedTouches' in event) {
            // TouchEvent의 경우
            canvasTouch = Array.from(event.changedTouches).find(
                touch => (touch.target as HTMLElement).tagName.toLowerCase() === 'canvas',
            );
        } else {
            // MouseEvent의 경우
            canvasTouch =
                (event.target as HTMLElement).tagName.toLowerCase() === 'canvas'
                    ? (event as unknown as Touch) // MouseEvent를 Touch로 캐스팅
                    : undefined;
        }

        if (!canvasTouch) return;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(pointer, camera);
        const model = getAtomValue(modelAtom);

        if (!model) {
            throw new Error('no model');
        }
        const filterChildren = model.children.filter(child => {
            return !child.name.includes('probe');
        });
        const intersects = raycaster.intersectObjects(filterChildren, true);
        if (!intersects.length) return;

        const targetPoint = intersects[0].point;
        if (!isDrag) {
            const startQuat = camera.quaternion.clone();
            const tempCamera = camera.clone();

            tempCamera.lookAt(targetPoint);
            const targetQuat = tempCamera.quaternion;
            if (quaternionAnimation) quaternionAnimation.kill();
            quaternionAnimation = gsap.to(
                { t: 0 },
                {
                    t: 1,
                    duration: 1,
                    onUpdate: function () {
                        if (doubleTap) {
                            quaternionAnimation?.kill();
                        }
                        camera.quaternion.slerpQuaternions(
                            startQuat,
                            targetQuat,
                            this.targets()[0].t,
                        );
                    },
                },
            );
        }
    };

    //터치했을때때
    const handleTouchStart = (e: TouchEvent) => {
        const canvasTouch = getCanvasTouch(e.touches);
        if (canvasTouch) {
            if (e.touches.length === 2) {
                // 두손가락 터치 작용 시 실행할 코드 작성
                cameraState.current.isRotating = false;
                cameraState.current.doubleTouch = true;
                cameraState.current.previousTouchPosition = {
                    x: canvasTouch.clientX,
                    y: canvasTouch.clientY,
                };
            } else {
                cameraState.current.isRotating = true;
                const action = { rotation: true };
                cameraState.current.previousTouchPosition = {
                    x: action.rotation ? -canvasTouch.clientX : canvasTouch.clientX,
                    y: action.rotation ? -canvasTouch.clientY : canvasTouch.clientY,
                };
            }
        }
    };

    // 터치후 움직일때때
    const handleTouchMove = (e: TouchEvent) => {



        e.preventDefault();
        const canvasTouch = getCanvasTouch(e.touches);

        if (
            canvasTouch &&
            e.touches.length === 2 &&

            cameraState.current.doubleTouch
        ) {
            const deltaX =
                canvasTouch.clientX - cameraState.current.previousTouchPosition.x;
            const deltaY =
                canvasTouch.clientY - cameraState.current.previousTouchPosition.y;
            cameraState.current.previousTouchPosition = {
                x: canvasTouch.clientX,
                y: canvasTouch.clientY,
            };
            cameraState.current.deltaVector = {
                x: deltaX,
                y: deltaY,
            };
            if (!cameraState.current.animationFrameId) {
                cameraState.current.prevFrameTime = 0;
                cameraState.current.animationFrameId = requestAnimationFrame(t =>
                    animateTouchMove(t),
                );
            }
        }

        if (
            canvasTouch &&
            e.touches.length === 1 &&
            cameraState.current.isRotating &&
            !cameraState.current.doubleTouch
        ) {
            const action = { rotation: true };

            const deltaX = action.rotation
                ? -canvasTouch.clientX - cameraState.current.previousTouchPosition.x
                : canvasTouch.clientX - cameraState.current.previousTouchPosition.x;
            const deltaY = action.rotation
                ? -canvasTouch.clientY - cameraState.current.previousTouchPosition.y
                : canvasTouch.clientY - cameraState.current.previousTouchPosition.y;
            cameraState.current.isDragging = true;

            if (deltaX !== 0) {
                moveCameraRotation(deltaX, deltaY);

                cameraState.current.previousTouchPosition = {
                    x: action.rotation ? -canvasTouch.clientX : canvasTouch.clientX,
                    y: action.rotation ? -canvasTouch.clientY : canvasTouch.clientY,
                };
            }
        }
    };

    // 터치끝났을때때
    const handleTouchEnd = (e: TouchEvent) => {



        const canvasTouch = getCanvasTouch(e.changedTouches);

        if (canvasTouch && e.touches.length === 0) {
            cameraState.current.isRotating = false;
            applyInertia();
            const currentTime = Date.now();
            const tapInterval = currentTime - cameraState.current.prevTapTime;



            if (!cameraState.current.isDragging && !cameraState.current.doubleTouch) {
                if (tapInterval < 200 && tapInterval > 100) {
                    //   if (timerIdRef.current) {
                    //     clearTimeout(timerIdRef.current);
                    //     timerIdRef.current = null;
                    //   }
                    //   if (cameraAction.pathFinding.isAnimation) {
                    //     camera.moveTo({ pathFinding: { stopAnimation: true } });
                    //     setAtomValue(cameraActionAtom, pre => ({
                    //       ...pre,
                    //       pathFinding: { ...pre.pathFinding, isAnimation: false },
                    //     }));
                    //   }
                    //   setAtomValue(pointMarkerAtom, pre => ({ ...pre, on: false }));
                    //   cameraState.current.doubleTap = true;
                    //   handleDoubleClick(e);
                    //   e.preventDefault();
                } else {
                    if (timerIdRef.current) clearTimeout(timerIdRef.current);
                    timerIdRef.current = setTimeout(() => {
                        handleSingleClick(
                            e,
                            pointer,
                            camera as THREE.PerspectiveCamera,
                            cameraState.current.isDragging,
                            cameraState.current.doubleTap,
                        );
                        timerIdRef.current = null;
                    }, 200);
                }
            }
            if (cameraState.current.doubleTouch) {
                cameraState.current.doubleTouch = false;
                if (
                    cameraState.current.animationFrameId &&
                    cameraState.current.moveVelocity <= 0
                ) {
                    cancelAnimationFrame(cameraState.current.animationFrameId);
                    cameraState.current.animationFrameId = null;
                }
            }

            cameraState.current.prevTapTime = currentTime;
            cameraState.current.isDragging = false;
        }
    };

    // 캔버스에에 이벤트 등록
    useEffect(() => {
        const element = document.getElementById('canvasDiv');
        if (!element || !camera) return;
        element.addEventListener('touchstart', handleTouchStart);
        element.addEventListener('touchmove', handleTouchMove);
        element.addEventListener('touchend', handleTouchEnd);
        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, [camera]);

    // quaternionAnimation 언마운트
    useEffect(() => {
        return () => {
            if (quaternionAnimation) {
                quaternionAnimation.kill();
                quaternionAnimation = null;
            }
        };
    }, []);

    return null;
}

export default MobileCameraManager