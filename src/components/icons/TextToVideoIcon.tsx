import Svg, { Path, Rect } from "react-native-svg";

export function TextToVideoIcon({
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
      <Rect x={3} y={3} width={18} height={18} rx={2} />
      <Path d="M7 3v18" />
      <Path d="M17 3v18" />
      <Path d="M3 7.5h4" />
      <Path d="M3 12h4" />
      <Path d="M3 16.5h4" />
      <Path d="M17 7.5h4" />
      <Path d="M17 12h4" />
      <Path d="M17 16.5h4" />
    </Svg>
  );
}
