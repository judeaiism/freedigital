import React from 'react';
import { CustomShapeProps } from './types';

const CustomBar = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  fill = "#8884d8",
  payload,
}: CustomShapeProps): React.ReactElement => {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} />
      {payload.icon && (
        <foreignObject
          x={x + width / 2 - 8}
          y={y + height - 20}
          width={16}
          height={16}
        >
          {payload.icon}
        </foreignObject>
      )}
    </g>
  );
};

export default CustomBar;

