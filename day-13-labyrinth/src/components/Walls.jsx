import React from "react";

function Walls(props) {
  const { position, args } = props;

  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}

export default Walls;
