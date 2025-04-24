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

export const isIntersectFromPoints = (
  line1: [number, number][],
  line2: [number, number][]
): boolean => {
  const [a, b] = line1;
  const [c, d] = line2;

  function ccw(
    p1: [number, number],
    p2: [number, number],
    p3: [number, number]
  ) {
    const result =
      (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p2[1] - p1[1]) * (p3[0] - p1[0]);
    if (result > 0) return 1;
    if (result < 0) return -1;
    return 0;
  }

  const ab = ccw(a, b, c) * ccw(a, b, d);
  const cd = ccw(c, d, a) * ccw(c, d, b);

  if (ab === 0 && cd === 0) {
    const [a1x, a2x] = [Math.min(a[0], b[0]), Math.max(a[0], b[0])];
    const [a1y, a2y] = [Math.min(a[1], b[1]), Math.max(a[1], b[1])];
    const [b1x, b2x] = [Math.min(c[0], d[0]), Math.max(c[0], d[0])];
    const [b1y, b2y] = [Math.min(c[1], d[1]), Math.max(c[1], d[1])];
    return a1x <= b2x && b1x <= a2x && a1y <= b2y && b1y <= a2y;
  }

  return ab <= 0 && cd <= 0;
};

export const isPointOnLine = (
  point: number[],
  line1: [number, number],
  line2: [number, number]
) => {
  const a = line2[1] - line1[1];
  const b = line1[0] - line2[0];
  const c = line2[0] * line1[1] - line1[0] * line2[1];
  return (
    a * point[0] + b * point[1] + c === 0 &&
    point[0] >= Math.min(line1[0], line2[0]) &&
    point[0] <= Math.max(line1[0], line2[0]) &&
    point[1] >= Math.min(line1[1], line2[1]) &&
    point[1] <= Math.max(line1[1], line2[1])
  );
};
