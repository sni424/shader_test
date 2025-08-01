import React from 'react'
import UxCanvasComponent from '../components/uxTest/UxCanvasComponent'
import UxModelLoad from '../components/uxTest/UxModelLoad'
import UxUiComponent from '../components/uxTest/uiComponents/UxUiComponent'
import { Environment, OrbitControls } from '@react-three/drei'
import CameraManager from '../components/uxTest/three/CameraManager'

const UXTest = () => {
    return (
        <>
            <div style={{ width: "100%", height: "100vh" }}>
                <UxUiComponent />
                <UxCanvasComponent>
                    <UxModelLoad />
                    {/* <OrbitControls /> */}
                    <CameraManager />
                    <Environment preset="city" />
                </UxCanvasComponent>
            </div>
        </>
    )
}

export default UXTest