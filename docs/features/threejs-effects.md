# Three.js WebView Effects

This feature adds fun 3D screen effects to ReceiptRadar using Three.js rendered in a WebView. These effects can be used for celebrations, feedback, and engaging user interactions.

## Features

- **Particle Systems**: Floating particles that bounce around the screen
- **Wave Effects**: Animated wave patterns that ripple across the screen
- **Floating Objects**: 3D objects that float and rotate in space
- **Confetti Rain**: Colorful confetti that falls from the top
- **Customizable**: Color, intensity, and duration can be customized
- **Performance Optimized**: Uses WebView for smooth 3D rendering

## Components

### ThreeJSWebView

The main component that renders Three.js effects in a WebView overlay.

```tsx
import ThreeJSWebView from "@/components/ThreeJSWebView";

<ThreeJSWebView
  effect="confetti"
  color="#4CAF50"
  intensity={1.5}
  duration={3000}
  onLoad={() => console.log("Effect loaded")}
/>;
```

### useThreeJSEffects Hook

A custom hook that provides easy access to predefined effects.

```tsx
import { useThreeJSEffects } from "@/hooks/useThreeJSEffects";

const { triggerSuccess, triggerSavings, triggerReceiptProcessed } =
  useThreeJSEffects();

// Trigger effects
triggerSuccess(); // Green confetti
triggerSavings(); // Golden particles
triggerReceiptProcessed(); // Purple floating objects
```

### WithThreeJSEffects HOC

A higher-order component that wraps any screen with Three.js effects capability.

```tsx
import { withThreeJSEffects } from "@/components/WithThreeJSEffects";

const MyScreen = () => <View>...</View>;
export default withThreeJSEffects(MyScreen);
```

## Available Effects

### 1. Particles

- **Effect**: Floating spheres that bounce around
- **Best for**: General feedback, subtle animations
- **Colors**: Any hex color
- **Intensity**: 0.5 - 2.0

### 2. Waves

- **Effect**: Animated wave patterns
- **Best for**: Calming effects, achievements
- **Colors**: Blues, greens work well
- **Intensity**: 0.5 - 1.5

### 3. Floating Objects

- **Effect**: 3D cubes, spheres, cones that float and rotate
- **Best for**: Receipt processing, complex actions
- **Colors**: Purples, oranges work well
- **Intensity**: 0.8 - 1.5

### 4. Confetti

- **Effect**: Colorful confetti that falls with gravity
- **Best for**: Celebrations, success states
- **Colors**: Multiple colors automatically generated
- **Intensity**: 1.0 - 2.0

## Usage Examples

### Success States

```tsx
const { triggerSuccess } = useThreeJSEffects();

const handleSave = () => {
  // Save data
  saveData();
  // Trigger success effect
  triggerSuccess();
};
```

### Savings Discovered

```tsx
const { triggerSavings } = useThreeJSEffects();

const handlePriceDrop = () => {
  // Process price drop
  processPriceDrop();
  // Trigger golden particles
  triggerSavings();
};
```

### Receipt Processing

```tsx
const { triggerReceiptProcessed } = useThreeJSEffects();

useEffect(() => {
  if (receiptProcessed) {
    triggerReceiptProcessed();
  }
}, [receiptProcessed]);
```

### Custom Effects

```tsx
const { triggerEffect } = useThreeJSEffects();

const handleCustomAction = () => {
  triggerEffect({
    effect: "particles",
    color: "#FF5722",
    intensity: 1.2,
    duration: 4000,
  });
};
```

## Integration Guide

### 1. Add to Existing Screen

```tsx
import { useThreeJSEffects } from "@/hooks/useThreeJSEffects";
import { WithThreeJSEffects } from "@/components/WithThreeJSEffects";

const MyScreen = () => {
  const { triggerSuccess } = useThreeJSEffects();

  return (
    <WithThreeJSEffects>
      <View>
        <Button onPress={triggerSuccess}>Success!</Button>
      </View>
    </WithThreeJSEffects>
  );
};
```

### 2. Global Integration

Wrap your app with the effects provider:

```tsx
import { ThreeJSEffectsProvider } from "@/components/WithThreeJSEffects";

export default function App() {
  return (
    <ThreeJSEffectsProvider>{/* Your app content */}</ThreeJSEffectsProvider>
  );
}
```

### 3. Conditional Effects

```tsx
const { triggerEffect } = useThreeJSEffects();

const handleAction = (actionType: string) => {
  switch (actionType) {
    case "success":
      triggerEffect({ effect: "confetti", color: "#4CAF50" });
      break;
    case "warning":
      triggerEffect({ effect: "particles", color: "#FF9800" });
      break;
    case "error":
      triggerEffect({ effect: "particles", color: "#F44336" });
      break;
  }
};
```

## Performance Considerations

- Effects automatically clean up after their duration
- WebView is only rendered when effects are active
- Effects use requestAnimationFrame for smooth animations
- Memory is properly managed with cleanup functions

## Customization

### Adding New Effects

1. Add the effect type to the `EffectType` union
2. Implement the effect in the Three.js code
3. Add preset configuration
4. Update the hook with new trigger function

### Styling

Effects are rendered as overlays with `zIndex: 1000`. They automatically cover the full screen and are transparent to touch events.

### Timing

Effects are designed to be non-intrusive and automatically disappear. Typical durations are 2-5 seconds.

## Demo

Visit `/threejs-effects-demo` in the app to see all effects in action and test different configurations.

## Troubleshooting

### Effect Not Showing

- Ensure `react-native-webview` is installed
- Check that the WebView has proper permissions
- Verify the effect configuration is valid

### Performance Issues

- Reduce intensity for better performance
- Use shorter durations
- Consider device capabilities

### WebView Issues

- Ensure JavaScript is enabled
- Check for network connectivity (Three.js CDN)
- Verify WebView configuration in the component
