import Svg, { Path, Polygon, Rect } from "react-native-svg";

export function ShortGeneratorIcon({
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
      <Rect x={5} y={2} width={14} height={20} rx={2} />
      <Path d="M12 18h.01" />
      <Polygon points="10 9 15 12 10 15 10 9" fill={color} />
    </Svg>
  );
}
