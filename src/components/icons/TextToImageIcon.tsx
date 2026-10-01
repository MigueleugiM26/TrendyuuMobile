import Svg, { Circle, Path, Rect } from "react-native-svg";

export function TextToImageIcon({
  size = 24,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Rect x={3} y={3} width={18} height={18} rx={2} ry={2} />
      <Circle cx={9} cy={9} r={2} />
      <Path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      <Path d="M3 7h4" />
      <Path d="M5 5v4" />
    </Svg>
  );
}
