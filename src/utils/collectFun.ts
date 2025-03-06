import * as THREE from "three";

export const deleteDot = (scene: THREE.Scene) => {
  if (scene && scene.children) {
    const circlesToRemove = scene.children.filter(
      (item) => item.name && item.name.includes("circle")
    );

    circlesToRemove.forEach((circle) => {
      const mesh = circle as THREE.Mesh;

      mesh.removeFromParent();

      if (mesh.geometry) {
        mesh.geometry.dispose();
      }

      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => {
            if ("dispose" in mat) {
              mat.dispose();
            }
          });
        } else if ("dispose" in mesh.material) {
          (mesh.material as THREE.Material).dispose();
        }
      }
    });
  }
};

export const deleteLine = (scene: THREE.Scene) => {
  const circlesToRemove = scene.children.filter(
    (item) => item.name && item.name.includes("dimensionLine")
  );
  circlesToRemove.forEach((dimensionLine) => {
    const mesh = dimensionLine as THREE.Mesh;

    scene.remove(mesh);

    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((mat) => {
          if ("dispose" in mat) {
            mat.dispose();
          }
        });
      } else if ("dispose" in mesh.material) {
        (mesh.material as THREE.Material).dispose();
      }
    }
  });
};
