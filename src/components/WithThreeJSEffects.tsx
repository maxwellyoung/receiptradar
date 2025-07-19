import React from "react";
import { View } from "react-native";
import ThreeJSWebView from "./ThreeJSWebView";
import { useThreeJSEffects, EffectConfig } from "@/hooks/useThreeJSEffects";

interface WithThreeJSEffectsProps {
  children: React.ReactNode;
}

export const WithThreeJSEffects: React.FC<WithThreeJSEffectsProps> = ({
  children,
}) => {
  const { isPlaying, activeEffect } = useThreeJSEffects();

  return (
    <View style={{ flex: 1 }}>
      {children}
      {isPlaying && activeEffect && (
        <ThreeJSWebView
          effect={activeEffect.effect}
          color={activeEffect.color}
          intensity={activeEffect.intensity}
          duration={activeEffect.duration}
        />
      )}
    </View>
  );
};

// Higher-order component for easy integration
export const withThreeJSEffects = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => (
    <WithThreeJSEffects>
      <Component {...props} />
    </WithThreeJSEffects>
  );
};

// Context provider for global effects
export const ThreeJSEffectsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <WithThreeJSEffects>{children}</WithThreeJSEffects>;
};
