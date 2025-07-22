import React from "react";
import { View, StyleSheet } from "react-native";
import { getOfficialStoreLogo } from "../constants/officialStoreLogos";
import { MaterialIcons } from "@expo/vector-icons";
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  G,
  Rect,
  Text,
  Circle,
} from "react-native-svg";

interface OfficialStoreLogoProps {
  storeName: string;
  size?: number;
  showFallback?: boolean;
  style?: any;
}

export const OfficialStoreLogo: React.FC<OfficialStoreLogoProps> = ({
  storeName,
  size = 40,
  showFallback = true,
  style,
}) => {
  const storeConfig = getOfficialStoreLogo(storeName);

  const renderCountdownLogo = () => (
    <Svg width={size} height={size} viewBox="0 0 403.73 365.15">
      <Defs>
        <LinearGradient
          id="ww-n6uzulm-gradient1"
          x1="439.81"
          y1="339.76"
          x2="312.59"
          y2="310.08"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.12" stopColor="#468c3d" />
          <Stop offset="0.51" stopColor="#82ab41" />
          <Stop offset="0.84" stopColor="#adc245" />
          <Stop offset="1" stopColor="#becb46" />
        </LinearGradient>
        <LinearGradient
          id="ww-n6uzulm-gradient2"
          x1="391.92"
          y1="64.81"
          x2="391.92"
          y2="351.95"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#589b38" />
          <Stop offset="0.11" stopColor="#70a63b" />
          <Stop offset="0.29" stopColor="#91b640" />
          <Stop offset="0.46" stopColor="#aac243" />
          <Stop offset="0.62" stopColor="#b9c945" />
          <Stop offset="0.75" stopColor="#becb46" />
        </LinearGradient>
        <LinearGradient
          id="ww-n6uzulm-gradient3"
          x1="161.29"
          y1="64.81"
          x2="161.29"
          y2="351.95"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#589b38" />
          <Stop offset="0.11" stopColor="#70a63b" />
          <Stop offset="0.29" stopColor="#91b640" />
          <Stop offset="0.46" stopColor="#aac243" />
          <Stop offset="0.62" stopColor="#b9c945" />
          <Stop offset="0.75" stopColor="#becb46" />
        </LinearGradient>
        <LinearGradient
          id="ww-n6uzulm-gradient4"
          x1="231.94"
          y1="198.81"
          x2="231.94"
          y2="338.69"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.19" stopColor="#468c3d" />
          <Stop offset="0.57" stopColor="#91b443" />
          <Stop offset="0.78" stopColor="#becb46" />
        </LinearGradient>
        <LinearGradient
          id="ww-n6uzulm-gradient5"
          x1="177.39"
          y1="392.23"
          x2="283.03"
          y2="-6.27"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.05" stopColor="#468c3d" />
          <Stop offset="0.11" stopColor="#5a973f" />
          <Stop offset="0.24" stopColor="#85ad42" />
          <Stop offset="0.35" stopColor="#a4bd44" />
          <Stop offset="0.45" stopColor="#b7c745" />
          <Stop offset="0.52" stopColor="#becb46" />
        </LinearGradient>
        <LinearGradient
          id="ww-n6uzulm-gradient6"
          x1="254.21"
          y1="157.3"
          x2="376.29"
          y2="36.8"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#78a735" />
          <Stop offset="0.44" stopColor="#98b83d" />
          <Stop offset="1" stopColor="#becb46" />
        </LinearGradient>
      </Defs>
      <Path
        d="M348,349.88a103.44,103.44,0,0,1-25.79-3.2h0c-13.39,18.37-30.63,34.26-50.6,45.14a121.89,121.89,0,0,0,58.59,15.33c81,0,136.11-84.22,142.63-155.82C470.23,260.78,453.55,349.88,348,349.88Z"
        transform="translate(-69.71 -42)"
        fill="url(#ww-n6uzulm-gradient1)"
      />
      <Path
        d="M368.12,126c-39,0-57.71,22.61-57.71,22.61,40.22,4.08,89.61,32.44,89.61,91.2,0,57.06-37.4,83-68,91.64a169.33,169.33,0,0,1-9.88,15.19,103.44,103.44,0,0,0,25.79,3.2c105.59,0,122.27-89.1,124.83-98.55.45-4.81.65-9.52.65-14.19C473.44,156.82,412.12,126,368.12,126Z"
        transform="translate(-69.71 -42)"
        fill="url(#ww-n6uzulm-gradient2)"
      />
      <Path
        d="M195.18,349.88A99.5,99.5,0,0,0,252.86,332,66.64,66.64,0,0,1,234.25,335c-29.8,0-91.11-22.06-91.11-95.13,0-58.76,49.39-87.12,89.61-91.2,0,0-18.75-22.61-57.71-22.61-44,0-105.33,30.78-105.33,111.1,0,4.67.21,9.38.66,14.19C72.94,260.85,89.29,349.88,195.18,349.88Z"
        transform="translate(-69.71 -42)"
        fill="url(#ww-n6uzulm-gradient3)"
      />
      <Path
        d="M234.25,335A66.64,66.64,0,0,0,252.86,332h0a98.19,98.19,0,0,0,19-17.51h0c-3.72-4.67-21-28-21-59.28,0-29.25,15.67-41.73,20.85-45.06h0A52.62,52.62,0,0,0,242,199.83c-11.1,0-41.1,7.61-48.19,41.88a.15.15,0,0,0,0,0s0,.07,0,.11c-.26,1.38-.49,2.74-.69,4.1A152.17,152.17,0,0,0,192,264.83c0,27.47,11.71,52.09,20.85,67.13A86.14,86.14,0,0,0,234.25,335Z"
        transform="translate(-69.71 -42)"
        fill="url(#ww-n6uzulm-gradient4)"
      />
      <Path
        d="M272.14,172.69c-48.9,0-72.15,36-78.37,69,7.09-34.27,37.09-41.88,48.19-41.88a52.62,52.62,0,0,1,29.78,10.34h0c11.72,8.74,21.82,23.5,21.82,47.06,0,20.11-7.81,40.66-21.67,57.29h0c-17.31,20.77-44,35.35-76.73,35.35-105.88,0-122.24-89-124.82-98.55C76.88,322.93,132,407.15,213,407.15c79.07,0,139.51-79.83,139.51-146.68C352.5,214.13,326.18,172.69,272.14,172.69Z"
        transform="translate(-69.71 -42)"
        fill="url(#ww-n6uzulm-gradient5)"
      />
      <Path
        d="M273.6,145.41s-16.86-16.22-18-38.33A58,58,0,0,1,286.7,52.75c59.59-31.9,111.4,14.5,105.39,44.56,0,0-44.39-20.18-85.27,4C276.74,119,273.6,145.41,273.6,145.41Z"
        transform="translate(-69.71 -42)"
        fill="url(#ww-n6uzulm-gradient6)"
      />
    </Svg>
  );

  const renderPaknSaveLogo = () => (
    <Svg width={size} height={size * 0.5} viewBox="0 0 40 20">
      {/* Super simple Pak'nSave logo */}
      <Rect x="0" y="0" width="40" height="20" fill="#fbd100" />
      <Rect
        x="2"
        y="2"
        width="36"
        height="16"
        fill="none"
        stroke="#000"
        strokeWidth="1"
      />
      {/* Big P */}
      <Rect x="6" y="4" width="3" height="12" fill="#000" />
      <Rect x="6" y="4" width="8" height="3" fill="#000" />
      <Rect x="6" y="9" width="6" height="3" fill="#000" />
      {/* Big S */}
      <Rect x="22" y="4" width="8" height="3" fill="#000" />
      <Rect x="22" y="9" width="8" height="3" fill="#000" />
      <Rect x="22" y="14" width="8" height="3" fill="#000" />
      <Rect x="22" y="4" width="3" height="6" fill="#000" />
      <Rect x="27" y="9" width="3" height="6" fill="#000" />
    </Svg>
  );

  const renderNewWorldLogo = () => (
    <Svg width={size} height={size * 0.5} viewBox="0 0 40 20">
      {/* Super simple New World logo */}
      <Rect x="0" y="0" width="40" height="20" fill="#231F20" />
      <Circle cx="20" cy="10" r="8" fill="#FFF" />
      {/* Big N */}
      <Rect x="8" y="4" width="2" height="12" fill="#E11A2C" />
      <Rect x="8" y="4" width="6" height="2" fill="#E11A2C" />
      <Rect x="12" y="4" width="2" height="12" fill="#E11A2C" />
      {/* Big W */}
      <Rect x="18" y="4" width="2" height="12" fill="#E11A2C" />
      <Rect x="18" y="4" width="6" height="2" fill="#E11A2C" />
      <Rect x="22" y="4" width="2" height="12" fill="#E11A2C" />
      <Rect x="18" y="14" width="6" height="2" fill="#E11A2C" />
      <Rect x="24" y="4" width="2" height="12" fill="#E11A2C" />
    </Svg>
  );

  const renderFreshChoiceLogo = () => (
    <Svg width={size} height={size * 0.5} viewBox="0 0 40 20">
      {/* Super simple Fresh Choice logo */}
      <Rect x="0" y="0" width="40" height="20" fill="#00aeef" />
      {/* Big F */}
      <Rect x="6" y="4" width="2" height="12" fill="#FFF" />
      <Rect x="6" y="4" width="8" height="2" fill="#FFF" />
      <Rect x="6" y="9" width="6" height="2" fill="#FFF" />
      {/* Big C */}
      <Rect x="22" y="4" width="8" height="2" fill="#FFF" />
      <Rect x="22" y="14" width="8" height="2" fill="#FFF" />
      <Rect x="22" y="4" width="2" height="12" fill="#FFF" />
      <Circle cx="32" cy="6" r="3" fill="#CDD936" />
    </Svg>
  );

  const renderWarehouseLogo = () => (
    <Svg width={size} height={size} viewBox="0 0 21 20">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.2747 1.04159e-10H5.28738C4.09289 -8.10946e-06 2.94708 0.473528 2.10089 1.3169C1.2547 2.16027 0.777106 3.30474 0.772705 4.49964V15.498C0.776478 16.6933 1.2538 17.8384 2.10005 18.6823C2.94631 19.5261 4.09248 20 5.28738 20H16.2842C17.4745 19.9931 18.614 19.5162 19.4546 18.6731C20.2952 17.8299 20.769 16.6888 20.7727 15.498V4.49964C20.7683 3.30761 20.293 2.16566 19.4504 1.32276C18.6078 0.47986 17.4663 0.00438366 16.2747 1.04159e-10V1.04159e-10ZM2.96826 13.7675L8.3027 6.02805H11.4155L6.06913 13.7675H2.96826ZM13.1643 13.7675H7.99143L13.3377 6.02805H18.494L13.1643 13.7675Z"
        fill="#CC0000"
      />
    </Svg>
  );

  const renderLogo = () => {
    const lowerName = storeName.toLowerCase();

    if (lowerName.includes("countdown")) {
      return renderCountdownLogo();
    } else if (
      lowerName.includes("pak'n'save") ||
      lowerName.includes("paknsave") ||
      lowerName.includes("pak n save")
    ) {
      return renderPaknSaveLogo();
    } else if (lowerName.includes("new world")) {
      return renderNewWorldLogo();
    } else if (lowerName.includes("fresh choice")) {
      return renderFreshChoiceLogo();
    } else if (lowerName.includes("warehouse")) {
      return renderWarehouseLogo();
    } else {
      // Fallback to icon
      return (
        <View style={[styles.container, { width: size, height: size }, style]}>
          <MaterialIcons
            name={
              (typeof storeConfig.fallbackIcon === "string"
                ? (storeConfig.fallbackIcon as keyof typeof MaterialIcons.glyphMap)
                : "store") || "store"
            }
            size={size * 0.6}
            color={storeConfig.color}
          />
        </View>
      );
    }
  };

  return (
    <View
      style={[styles.container, { width: size, height: size * 0.6 }, style]}
    >
      {renderLogo()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
