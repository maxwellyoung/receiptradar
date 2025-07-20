# Effects Integration Guide

## Overview

The `SimpleEffects` component provides lightweight, performant screen effects for celebrations and feedback in ReceiptRadar. These effects are designed to enhance user experience without being intrusive.

## Available Effects

### Confetti Effect

- **Use case**: Celebrations, successful actions
- **Visual**: Colorful particles falling from top of screen
- **Colors**: 7 different vibrant colors (gold, red, purple, blue, green, orange, pink)
- **Animation**: 4-6 seconds duration with rotation and sparkle

### Particles Effect

- **Use case**: Subtle feedback, magical moments
- **Visual**: Floating particles in specified color
- **Animation**: Gentle floating motion with scaling and rotation
- **Duration**: 4-6 seconds

## Integration Examples

### Receipt Success Screen

```tsx
import { SimpleEffects } from "@/components/SimpleEffects";

export const ReceiptSuccessScreen = () => {
  const [showEffects, setShowEffects] = useState(false);

  useEffect(() => {
    // Trigger confetti when receipt is processed
    setTimeout(() => {
      setShowEffects(true);
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <SimpleEffects
        visible={showEffects}
        effect="confetti"
        color="#FFD700"
        onComplete={() => setShowEffects(false)}
      />
      {/* Rest of your UI */}
    </View>
  );
};
```

### Savings Achievement

```tsx
const handleSavingsAchievement = () => {
  setEffectType("particles");
  setShowEffects(true);
};

<SimpleEffects
  visible={showEffects}
  effect={effectType}
  color="#FFD700" // Golden particles for savings
  onComplete={() => setShowEffects(false)}
/>;
```

## Best Practices

1. **Timing**: Trigger effects after user actions complete (1-2 second delay)
2. **Frequency**: Don't overuse - save for meaningful moments
3. **Context**: Use confetti for celebrations, particles for subtle feedback
4. **Performance**: Effects are optimized for React Native Animated API
5. **Accessibility**: Effects are purely visual and don't interfere with screen readers

## Component Props

```tsx
interface SimpleEffectsProps {
  visible: boolean; // Controls effect visibility
  effect: "confetti" | "particles"; // Effect type
  color: string; // Color for particles effect
  onComplete?: () => void; // Callback when animation finishes
}
```

## Technical Details

- **Framework**: React Native Animated API
- **Performance**: 50 particles max, optimized rendering
- **Memory**: Automatic cleanup after animation
- **Compatibility**: Works with all React Native platforms
- **Dependencies**: No external libraries required

## Future Enhancements

- Sound effects integration
- Custom particle shapes
- More effect types (waves, explosions)
- Performance monitoring
- Accessibility options
