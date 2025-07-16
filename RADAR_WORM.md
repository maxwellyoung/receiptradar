# 🐛 Radar the Worm — Your Friendly Grocery Critic

Radar isn't a gimmick—he's a character layer that makes dry data feel alive. A worm who lives in your receipts, watches your habits, and gently judges your life choices.

## 🧠 Design Philosophy

- **Mascot-as-UI**: Radar is the interface for insight. Not a distraction, but a living feedback loop.
- **Think Clippy x Duolingo Owl x Braun calculator**—restrained, useful, cheeky only when needed.
- **Character-driven feedback**: Humans respond more to characters than charts. Radar gives emotional feedback to numeric data.

## 🧾 Behavioral States

| Mood          | Trigger                                | UI Feedback                              | Color   |
| ------------- | -------------------------------------- | ---------------------------------------- | ------- |
| 🙂 Calm       | Normal scan + under budget             | "Looks like a tidy little shop."         | #6FCF97 |
| 🐷 Concerned  | Over budget in Snacks / Convenience    | "Another chips binge, huh?"              | #F2994A |
| 😭 Dramatic   | Big spend + luxury items               | "Caviar? In this economy?"               | #EB5757 |
| 🧘‍♂️ Zen        | Budget streak or low spend             | "You are one with the pantry."           | #9B51E0 |
| 👀 Suspicious | Duplicate receipt / sketchy item parse | "Are you laundering groceries?"          | #F2C94C |
| 🧠 Insightful | Weekly report / savings badge unlocked | "You saved $9.60 this week. Worm proud." | #2F80ED |

## 🎨 Visual Identity

- **Form**: Soft rounded segments, pale green/beige/blush gradient
- **Eyes**: Dot eyes, deadpan most of the time, can emote (widen, narrow, sparkle)
- **Motion**: Slow, graceful crawl when loading; pops out of receipt edge like a scroll unrolling
- **Sound FX**: Optional — little slurp or pop when reacting

## 📈 Function, not just form

- **Reduces user anxiety** around spend
- **Increases retention** via parasocial attachment
- **Drives shareability** (screenshots with "Worm Reaction" become artefacts)
- **Enables monetisation**:
  - Worm skins (kawaii, goth, office dad)
  - Premium worm voiceovers (Sean Connery mode?)
  - Personalised worm insights via GPT

## 🛠 Technical Implementation

### Components

- **`RadarWorm.tsx`**: Main component with all moods, animations, and interactive features
- **`useRadarMood.ts`**: Hook that analyzes spending patterns to determine mood
- **`radar-demo.tsx`**: Interactive demo page showcasing all Radar features and controls

### Usage

```tsx
import { RadarWorm } from "@/components/RadarWorm";
import { useRadarMood } from "@/hooks/useRadarMood";

// In your component
const radarMood = useRadarMood({
  receiptData,
  categoryBreakdown,
  totalSpend,
  isProcessing: false,
  isError: false,
  isDuplicate: false,
  weeklySavings: 15.2,
  budgetStreak: 5,
});

<RadarWorm
  mood={radarMood.mood}
  message={radarMood.message}
  totalSpend={receiptData.total_amount}
  categoryBreakdown={categoryBreakdown}
  visible={true}
  size="medium"
  showSpeechBubble={radarMood.showSpeechBubble}
  onPress={() => console.log("Radar tapped!")}
/>;
```

### Mood Detection Logic

The `useRadarMood` hook analyzes:

1. **Processing state**: Shows calm Radar during scanning
2. **Error states**: Suspicious mood for invalid receipts
3. **Duplicate detection**: Suspicious mood for repeated receipts
4. **Luxury items**: Dramatic mood for expensive items (caviar, truffles, etc.)
5. **Snack spending**: Concerned mood when snacks > 30% of total
6. **Low spending**: Zen mood for receipts under $20
7. **Savings achievements**: Insightful mood with savings amount
8. **Budget streaks**: Zen mood for consistent budget adherence

### Animation System

- **Entrance**: Spring animation with scale and crawl effects
- **Eye animations**: Different patterns based on mood (wide, narrow, sparkle, squint, closed)
- **Speech bubble**: Delayed appearance with spring animation and rotation
- **Interactive**: Enhanced press animations with pulse effects
- **Continuous animations**: Wiggle, bounce, and breathing effects
- **Segment animations**: Individual segment rotations and scaling
- **Special interactions**: Unique animations every 3rd tap
- **Mood-based timing**: Different animation speeds based on mood intensity

## 🎯 Integration Points

### Current Integration

1. **Receipt Processing**: Radar appears during processing and after completion
2. **Interactive Demo Page**: Full showcase with controls, mood selector, and interactive features
3. **Tab Navigation**: Dedicated Radar tab for testing and demonstration
4. **Interactive Controls**: Toggle interactive mode, speech bubbles, and size options

### Future Integration Opportunities

1. **Dashboard**: Weekly spending overview with Radar commentary
2. **Trends Page**: Monthly insights with Radar's analysis
3. **Settings**: Radar customization options
4. **Notifications**: Push notifications with Radar reactions
5. **Social Sharing**: Radar reactions in shareable images

## 🚀 Why It Works

Humans respond more to characters than charts. Radar gives emotional feedback to numeric data—turning grocery budgets into a low-stakes social game. The character creates a parasocial relationship that increases user engagement and retention.

## 🎨 Customization

Radar is designed to be easily customizable:

- **Mood configurations**: Add new moods in `moodConfig` with custom animation parameters
- **Color schemes**: Modify colors for different themes
- **Animations**: Adjust timing, intensity, and effects for each mood
- **Messages**: Customize responses for different contexts
- **Sizes**: Small, medium, large variants for different UI contexts
- **Interactive features**: Toggle interactivity, speech bubbles, and animation intensity
- **Animation parameters**: Customize crawl speed, wiggle intensity, and eye animation patterns

## 🔮 Future Enhancements

- **Voice synthesis**: Text-to-speech for Radar's messages
- **AI integration**: GPT-powered personalized insights
- **Skin system**: Different Radar appearances
- **Sound effects**: Audio feedback for interactions
- **Advanced animations**: More complex movement patterns
- **Contextual awareness**: Location and time-based reactions
- **Gesture recognition**: Swipe and drag interactions
- **Haptic feedback**: Tactile responses for interactions
- **Animation presets**: Save and share custom animation configurations
- **Social features**: Share Radar reactions and achievements
