import { Canvas } from "@react-three/fiber";
import BoxImageTransition from "./components/BoxImageTransition";
import { Environment, OrbitControls } from "@react-three/drei";
import { useState } from "react";
import ModelTextureTransition from "./components/ModelTextureTransition";
import ModelOnBeforeShader from "./components/ModelOnBeforeShader";
import CheckPBRShader from "./components/CheckPBRShader";
import CheckLightMap from "./components/CheckLightMap";
import CheckDimensions from "./components/CheckDimensions";
import CanvasClickEvent from "./components/CanvasClickEvent";
import PointMark from "./components/PointMark";

const step = [1, 2, 3, 4, 5, 6]

export default function App() {
  const [isClick, setClick] = useState(false)
  const [dimensionsClick, setDimensionsClick] = useState(false)
  const [pageStep, setPageStep] = useState(1)
  const clickFun = () => {
    setClick(pre => !pre)
  }
  return (
    <div
      style={{
        width: "100%",
        height: "100vh"
      }}
    >
      <div
        style={{
          position: "absolute",
          zIndex: "10",
          top: "2.5%",
          left: "50%",
          transform: "translateX(-50%)"
        }}>
        {step.map((child: number) => {
          return (
            <button
              key={`button_${child}`}
              style={{
                padding: "10px 10px",
                fontSize: "16px",
                cursor: "pointer"
              }}
              onClick={() => {
                setPageStep(child)
              }}
            >
              {child}
            </button>
          )
        })}
      </div>
      <button
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          zIndex: "10",
          cursor: "pointer"
        }}
        onClick={() => {
          clickFun()
        }}
      >
        전환하기
      </button>
      <button
        style={{
          position: "absolute",
          top: "20px",
          left: "140px",
          padding: "10px 20px",
          fontSize: "16px",
          zIndex: "10",
          cursor: "pointer"
        }}
        onClick={() => {
          setDimensionsClick(pre => !pre)
        }}
      >
        {dimensionsClick ? "측정취소" : "거리측정"}
      </button>
      <div id="canvasDiv"
        style={{
          width: "100%",
          height: "100vh"
        }}
      >
        <Canvas>
          {pageStep === 1 &&
            <ModelTextureTransition isClick={isClick} />
          }
          {pageStep === 2 &&
            <BoxImageTransition isClick={isClick} />
          }
          {pageStep === 3 &&
            <ModelOnBeforeShader isClick={isClick} />
          }
          {pageStep === 4 &&
            <CheckLightMap isClick={isClick} />
          }
          {pageStep === 5 &&
            <CheckPBRShader isClick={isClick} />
          }
          {pageStep === 6 &&
            <CheckDimensions />
          }


          <CanvasClickEvent dimensionsClick={dimensionsClick} />
          <OrbitControls />
          <PointMark />
          {pageStep !== 4 && <Environment preset="city" />}



        </Canvas>
      </div>
    </div>
  );
}

