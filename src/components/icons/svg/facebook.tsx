import Svg, { ClipPath, Defs, G, Path } from "react-native-svg";

export default function FacebookIcon() {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16">
      <Defs>
        <ClipPath id="clipPath6664416525">
          <Path
            transform="matrix(1 0 0 1 0 0)"
            d="M0 0L16 0L16 16L0 16L0 0Z"
            fill-rule="nonzero"
          />
        </ClipPath>
      </Defs>
      <G clip-path="url(#clipPath6664416525)">
        <Path
          transform="matrix(1 0 0 1 0.60375 0.60375)"
          d="M0.81625 0C0.365448 0 0 0.365448 0 0.81625L0 13.9775C0 14.4283 0.365448 14.7937 0.81625 14.7937L13.9775 14.7937C14.4283 14.7937 14.7937 14.4283 14.7937 13.9775L14.7937 0.81625C14.7937 0.365448 14.4283 0 13.9775 0L0.81625 0Z"
          fill-rule="nonzero"
          fill="rgb(61, 90, 152)"
        />
        <Path
          transform="matrix(1 0 0 1 6.5775 2.83729)"
          d="M4.2325 12.559L4.2325 6.83021L6.155 6.83021L6.4425 4.59771L4.2325 4.59771L4.2325 3.17271C4.2325 2.52646 4.4125 2.08521 5.33875 2.08521L6.52125 2.08521L6.52125 0.0852073C5.94863 0.025639 5.3732 -0.00273603 4.7975 0.000207503C3.095 0.000207503 1.9225 1.03771 1.9225 2.95146L1.9225 4.59771L0 4.59771L0 6.83021L1.9225 6.83021L1.9225 12.559L4.2325 12.559Z"
          fill-rule="nonzero"
          fill="rgb(255, 255, 255)"
        />
      </G>
    </Svg>
  );
}
