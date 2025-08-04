import React from 'react'
import UxCanvasComponent from '../components/uxTest/UxCanvasComponent'
import UxModelLoad from '../components/uxTest/UxModelLoad'
import UxUiComponent from '../components/uxTest/uiComponents/UxUiComponent'
import { Environment, OrbitControls } from '@react-three/drei'
import CameraManager from '../components/uxTest/three/CameraManager'
import useMobile from '../hook/useMobile'
import MobileCameraManager from '../components/uxTest/three/MobileCameraManager'
import Hotspot from '../components/uxTest/three/HotSpot'

const UXTest = () => {
    const { isMobile } = useMobile()

    return (
        <>
            <div style={{ width: "100%", height: "100vh", position: "relative" }}>
                <UxUiComponent isMobile={isMobile} />
                <UxCanvasComponent>
                    <UxModelLoad />
                    <Hotspot />
                    {/* <OrbitControls /> */}
                    {isMobile ? <MobileCameraManager /> : <CameraManager />}

                    <Environment files={"https://vra-configurator-dev.s3.ap-northeast-2.amazonaws.com/models/dancing_hall_1k.hdr"} />
                </UxCanvasComponent>
            </div>
        </>
    )
}

export default UXTest