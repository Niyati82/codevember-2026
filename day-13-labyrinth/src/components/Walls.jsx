import React from "react";

function Walls(props) {
  const { position, args } = props;

  return (
    <>
      {/* Dark metallic wall */}
      <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={args} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>
    </>
  );
}

export default Walls;
