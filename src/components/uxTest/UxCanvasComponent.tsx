import { Canvas } from '@react-three/fiber'
import React from 'react'

interface CanvasComponentProps {
    children: React.ReactNode;
}

const UxCanvasComponent: React.FC<CanvasComponentProps> = ({ children }) => {
    return (
        <div id="canvasDiv" style={{ width: "100%", height: "100%" }}>
            <Canvas>
                {children}
            </Canvas>
        </div>
    )
}

export default UxCanvasComponent