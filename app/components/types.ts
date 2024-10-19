import { RectangleProps } from "recharts";

export interface CustomPayload {
  icon?: React.ReactNode;
  // Replace [key: string]: any with a more specific type
  [key: string]: React.ReactNode | string | number | undefined;
}

export interface CustomShapeProps extends RectangleProps {
  payload: CustomPayload;
}

