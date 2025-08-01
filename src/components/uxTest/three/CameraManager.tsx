import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three"
import { clampAndUpdateCamera, tryCameraMove } from "../../../utils/utill";

interface CameraState {
    isRotating: boolean;
    isDragging: boolean;
    lastMouseDownTime: number;
    previousMousePosition: { x: number; y: number };
    rotationVelocity: { x: number; y: number };
    moveVelocity: number;
    animationFrameId: number | null;
    rotationAniFrameId: number | null;
    prevFrameTime: number | null;
    isWheeling: boolean;
    isWheelForward: boolean;
    activeKeys: Set<string>;
    lastMovementDirection: THREE.Vector3;
}

const basicSettingAtom = {
    clipping: 10,
    camera: {
        moveSpeed: 2,
        rotationSpeed: 1,
        inertia: 0.9,
        fov: 75,
        matrix: [
            -0.36708142704537816, -1.734723475976807e-16, 0.9301888119722366, 0,
            0.10836348894508008, 0.9931911339745508, 0.04276360202315978, 0,
            -0.923855280973146, 0.11649622909925321, -0.3645820187881954, 0,
            -2.1393239205928385, 1.3, 1.198629524582003, 1,
        ],
    },
};


// 카메라 관리 (PC 전용)
const CameraManager = () => {
    const { camera } = useThree();
    //이동키 누른다음 tour를 클릭하고 끄면 cameraState.current.animationFrameId가 null이 안됨됨


    const cameraState = useRef<CameraState>({
        // 카메라 회전 및 드래그 상태 관리를 위한 참조
        isRotating: false,
        isDragging: false,
        lastMouseDownTime: 0,
        // 키보드 및 마우스 입력 상태 관리
        previousMousePosition: { x: 0, y: 0 },
        // 회전 및 이동 속도 관리
        rotationVelocity: { x: 0, y: 0 },
        moveVelocity: 0,
        // 애니메이션 및 프레임 관리
        animationFrameId: null,
        rotationAniFrameId: null,
        prevFrameTime: null,
        isWheeling: false,
        isWheelForward: false,
        // 키보드
        activeKeys: new Set<string>(),
        //마지막 방향
        lastMovementDirection: new THREE.Vector3(),
    });

    // 반복 사용되는 키 배열 상수화
    const moveKeys = ['w', 'a', 's', 'd'];
    const rotationKeys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'];

    // 상태 관리 훅들
    const { camera: cameraSetting } = basicSettingAtom;

    // 헬퍼 함수: 이동 키 확인
    const isAnyMoveKeyPressed = () =>
        moveKeys.some(key => cameraState.current.activeKeys.has(key));

    // 헬퍼 함수: 회전 키 확인
    const isAnyRotationKeyPressed = () =>
        rotationKeys.some(key => cameraState.current.activeKeys.has(key));

    /**
     * 마우스 이동에 따른 카메라 회전 처리
     * @param deltaX 마우스 X축 이동 거리
     * @param deltaY 마우스 Y축 이동 거리
     */
    const moveCameraRotation = (deltaX: number, deltaY: number): void => {




        // 회전 감도 설정
        const sensitivity = cameraSetting.rotationSpeed;

        // 회전 속도에 관성 효과 적용
        cameraState.current.rotationVelocity.x =
            cameraState.current.rotationVelocity.x * 0.8 +
            deltaX * sensitivity * 0.0002;
        cameraState.current.rotationVelocity.y =
            cameraState.current.rotationVelocity.y * 0.8 +
            deltaY * sensitivity * 0.0002;

        // 카메라 회전 적용
        clampAndUpdateCamera(
            camera as THREE.PerspectiveCamera,
            50,
            -cameraState.current.rotationVelocity.x,
            -cameraState.current.rotationVelocity.y,
        );
    };

    /**
     * 회전 관성 효과 적용
     * 회전이 완전히 멈출 때까지 부드럽게 감속
     */
    const applyInertia = (): void => {
        if (
            !cameraState.current.isRotating &&
            (Math.abs(cameraState.current.rotationVelocity.x) > 0.001 ||
                Math.abs(cameraState.current.rotationVelocity.y) > 0.001)
        ) {
            // 관성 감소 비율 설정
            const inertiaFactor = Math.max(0.9, cameraSetting.inertia);

            cameraState.current.rotationVelocity.x *= inertiaFactor;
            cameraState.current.rotationVelocity.y *= inertiaFactor;

            // 부드러운 카메라 회전 적용
            clampAndUpdateCamera(
                camera as THREE.PerspectiveCamera,
                50,
                -cameraState.current.rotationVelocity.x / 1.1,
                -cameraState.current.rotationVelocity.y / 1.1,
            );


            requestAnimationFrame(applyInertia);
        }
    };

    /**
     * 카메라가 바닥 메시 위에 있는지 확인하는 함수
     * @param position 확인할 카메라 위치
     * @param floorMesh 바닥 메시
     * @returns 바닥 위에 있는지 여부
     */
    // const isCameraAboveFloor = (
    //   position: THREE.Vector3,
    //   floorMesh: THREE.Mesh,
    // ): boolean => {
    //   const raycaster = new THREE.Raycaster();
    //   raycaster.set(position, new THREE.Vector3(0, -1, 0));
    //   const intersections = raycaster.intersectObject(floorMesh, true);
    //   return intersections.length > 0;
    // };

    // 키 입력에 따른 이동 방향 계산
    const calculateMovementDirection = (deltaTime: number) => {
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        const right = new THREE.Vector3(-forward.z, 0, forward.x);

        const moveDirection = new THREE.Vector3();
        if (cameraState.current.activeKeys.has('w')) moveDirection.add(forward);
        if (cameraState.current.activeKeys.has('s')) moveDirection.sub(forward);
        if (cameraState.current.activeKeys.has('a')) moveDirection.sub(right);
        if (cameraState.current.activeKeys.has('d')) moveDirection.add(right);

        const speed = cameraState.current.activeKeys.has('shift')
            ? cameraSetting.moveSpeed + 1
            : cameraSetting.moveSpeed;

        if (moveDirection.length() > 0) {
            moveDirection.normalize();

            cameraState.current.lastMovementDirection.copy(moveDirection);
            return moveDirection.multiplyScalar(
                speed * cameraState.current.moveVelocity * deltaTime,
            );
        }
        return null;
    };

    const wheelMovementDirection = (deltaTime: number) => {
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const moveDirection = new THREE.Vector3();

        if (cameraState.current.isWheelForward) {
            moveDirection.add(forward);
        } else {
            moveDirection.sub(forward);
        }

        const speed = cameraState.current.activeKeys.has('shift')
            ? cameraSetting.moveSpeed + 1
            : cameraSetting.moveSpeed;

        if (moveDirection.length() > 0) {
            moveDirection.normalize();
            cameraState.current.lastMovementDirection.copy(moveDirection);
            return moveDirection.multiplyScalar(
                speed * cameraState.current.moveVelocity * deltaTime,
            );
        }
        return null;
    };

    /**
     * 방향키 입력에 따른 카메라 회전 계산
     * 방향키 눌림에 따라 카메라 회전 적용
     */
    const calculateRotationDirection = (): void => {
        // 회전축 및 방향 결정
        let xAxis = 0;
        let yAxis = 0;

        if (cameraState.current.activeKeys.has('arrowup')) xAxis -= 15;
        if (cameraState.current.activeKeys.has('arrowdown')) xAxis += 15;
        if (cameraState.current.activeKeys.has('arrowleft')) yAxis -= 20;
        if (cameraState.current.activeKeys.has('arrowright')) yAxis += 20;

        if (xAxis !== 0 || yAxis !== 0) {
            moveCameraRotation(yAxis, xAxis);
        }
    };



    // 관성 이동 처리 헬퍼 함수
    const applyInertiaMovement = (deltaTime: number, deceleration: number) => {
        cameraState.current.moveVelocity = Math.max(
            0,
            cameraState.current.moveVelocity - deceleration * deltaTime,
        );
    };

    const animateCamera = (
        currentTime: number,
        camera: THREE.PerspectiveCamera,
        animationType: 'keyboard' | 'wheel' | 'touch',
    ) => {


        // 경로 찾기 애니메이션 중이면 취소


        // deltaTime 계산
        const deltaTime = cameraState.current.prevFrameTime
            ? (currentTime - cameraState.current.prevFrameTime) / 1000
            : 0;
        cameraState.current.prevFrameTime = currentTime;

        // 애니메이션 타입에 따른 처리
        let continueAnimation = false;
        console.log("animationType", animationType)
        // 이동 처리
        switch (animationType) {
            case 'keyboard':
                if (isAnyMoveKeyPressed()) {
                    cameraState.current.moveVelocity = 1.0;
                    const movement = calculateMovementDirection(deltaTime);
                    if (movement)
                        tryCameraMove(movement, camera as THREE.PerspectiveCamera);
                    continueAnimation = true;
                } else if (cameraState.current.moveVelocity > 0) {
                    applyInertiaMovement(deltaTime, 2);
                    continueAnimation = true;
                }

                // 회전 처리 (키보드만 해당)
                if (isAnyRotationKeyPressed()) {
                    calculateRotationDirection();
                    continueAnimation = true;
                }
                break;

            case 'wheel':
                if (cameraState.current.isWheeling) {
                    cameraState.current.moveVelocity = 1.0;
                    const movement = wheelMovementDirection(deltaTime);
                    if (movement)
                        tryCameraMove(movement, camera as THREE.PerspectiveCamera);
                    cameraState.current.isWheeling = false;
                    continueAnimation = true;
                } else if (cameraState.current.moveVelocity > 0) {
                    applyInertiaMovement(deltaTime, 1);
                    continueAnimation = true;
                }
                break;
        }

        // 애니메이션 지속 여부
        if (continueAnimation || cameraState.current.moveVelocity > 0.01) {
            cameraState.current.animationFrameId = requestAnimationFrame(time =>
                animateCamera(time, camera, animationType),
            );
        } else {
            if (cameraState.current.animationFrameId) {
                cancelAnimationFrame(cameraState.current.animationFrameId);
                cameraState.current.animationFrameId = null;
            }
        }
    };

    // 동일한 참조를 사용하기 위해 별도의 함수로 추출
    const onContextMenu = (e: Event) => e.preventDefault();

    // canvasDiv에 마우스 이벤트 등록w
    useEffect(() => {
        const element = document.getElementById('canvasDiv');
        if (!element) throw new Error('no canvasDiv id');

        const handleMouseDown = (event: MouseEvent) => {

            const action = { rotation: true };
            cameraState.current.isRotating = true;
            cameraState.current.isDragging = false;
            cameraState.current.previousMousePosition = {
                x: action.rotation ? -event.clientX : event.clientX,
                y: action.rotation ? -event.clientY : event.clientY,
            };

        };

        const handleMouseMove = (event: MouseEvent) => {


            if (cameraState.current.isRotating) {
                const action = { rotation: true };
                cameraState.current.isDragging = true;

                const deltaX = action.rotation
                    ? -event.clientX - cameraState.current.previousMousePosition.x
                    : event.clientX - cameraState.current.previousMousePosition.x;

                const deltaY = action.rotation
                    ? -event.clientY - cameraState.current.previousMousePosition.y
                    : event.clientY - cameraState.current.previousMousePosition.y;

                moveCameraRotation(deltaX, deltaY);

                cameraState.current.previousMousePosition = {
                    x: action.rotation ? -event.clientX : event.clientX,
                    y: action.rotation ? -event.clientY : event.clientY,
                };
            }
        };

        const handleMouseUp = () => {
            const currentTime = Date.now();


            cameraState.current.isDragging = false;
            cameraState.current.isRotating = false;
            applyInertia();

            cameraState.current.lastMouseDownTime = currentTime;
        };

        const handleWheel = (event: WheelEvent) => {


            const isForward = event.deltaY < 0;

            // 방향전환
            if (isForward !== cameraState.current.isWheelForward) {
                if (cameraState.current.animationFrameId) {
                    cameraState.current.isWheeling = false;
                    cameraState.current.moveVelocity = 0;
                    cancelAnimationFrame(cameraState.current.animationFrameId);
                    cameraState.current.animationFrameId = null;
                }
            }

            cameraState.current.isWheeling = true;
            cameraState.current.isWheelForward = isForward;

            // 애니메이션이 실행 중이 아니면 새로 시작

            if (!cameraState.current.animationFrameId) {
                cameraState.current.prevFrameTime = null;
                cameraState.current.animationFrameId = requestAnimationFrame(time =>
                    animateCamera(time, camera as THREE.PerspectiveCamera, 'wheel'),
                );
            }

        };

        element.addEventListener('mousedown', handleMouseDown);
        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseup', handleMouseUp);
        element.addEventListener('wheel', handleWheel);
        window.addEventListener('contextmenu', onContextMenu);

        return () => {
            element.removeEventListener('mousedown', handleMouseDown);
            element.removeEventListener('mousemove', handleMouseMove);
            element.removeEventListener('mouseup', handleMouseUp);
            element.addEventListener('wheel', handleWheel);
            window.removeEventListener('contextmenu', onContextMenu);
        };
    }, []);

    // 키보드 이벤트 핸들러
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {


            cameraState.current.activeKeys.add(event.key.toLowerCase());

            if (
                !cameraState.current.animationFrameId &&
                (isAnyMoveKeyPressed() || isAnyRotationKeyPressed())
            ) {
                cameraState.current.prevFrameTime = null;
                cameraState.current.animationFrameId = requestAnimationFrame(time =>
                    animateCamera(time, camera as THREE.PerspectiveCamera, 'keyboard'),
                );
            }

        };

        const handleKeyUp = (event: KeyboardEvent) => {

            cameraState.current.activeKeys.delete(event.key.toLowerCase());
            if (
                !isAnyMoveKeyPressed() &&
                !isAnyRotationKeyPressed() &&
                cameraState.current.moveVelocity <= 0 &&
                cameraState.current.animationFrameId
            ) {
                cancelAnimationFrame(cameraState.current.animationFrameId);
                cameraState.current.animationFrameId = null;
            }

        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (cameraState.current.animationFrameId)
                cancelAnimationFrame(cameraState.current.animationFrameId);
        };
    }, []);

    //이동키 누른다음 tour를 클릭하고 끄면
    // cameraState.current.animationFrameId가 null이 안됨
    useEffect(() => {

        cameraState.current.animationFrameId = null;

    }, []);

    return null;
};

export default CameraManager;
