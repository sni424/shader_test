import { Route, Routes } from "react-router-dom";
import ShaderTest from "./pages/ShaderTest";
import UXTest from "./pages/UXTest";

export default function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<UXTest />} />
        <Route path="/mobile" element={<ShaderTest />} />
      </Routes>
    </>
  );
}

