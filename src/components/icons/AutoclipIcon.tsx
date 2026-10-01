import Svg, { Circle, Path } from "react-native-svg";

export function AutoClipIcon({
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
      <Circle cx={6} cy={6} r={3} />
      <Circle cx={6} cy={18} r={3} />
      <Path d="M20 4 8.12 15.88" />
      <Path d="M14.47 14.48 20 20" />
      <Path d="M8.12 8.12 12 12" />
    </Svg>
  );
}
