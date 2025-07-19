import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import { useTheme } from "react-native-paper";

interface ThreeJSWebViewProps {
  effect?: "particles" | "waves" | "floating" | "confetti" | "custom";
  color?: string;
  intensity?: number;
  duration?: number;
  onLoad?: () => void;
  style?: any;
  visible?: boolean;
}

const { width, height } = Dimensions.get("window");

const ThreeJSWebView: React.FC<ThreeJSWebViewProps> = ({
  effect = "particles",
  color = "#4CAF50",
  intensity = 1,
  duration = 3000,
  onLoad,
  style,
  visible = true,
}) => {
  const webViewRef = useRef<WebView>(null);
  const theme = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);

  const generateThreeJSCode = () => {
    const effectColor = color || theme.colors.primary;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 0;
              overflow: hidden;
              background: transparent;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            canvas {
              display: block;
            }
          </style>
        </head>
        <body>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
          <script>
            // Three.js setup
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, ${width} / ${height}, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ 
              antialias: true, 
              alpha: true,
              preserveDrawingBuffer: true
            });
            
            renderer.setSize(${width}, ${height});
            renderer.setClearColor(0x000000, 0);
            document.body.appendChild(renderer.domElement);

            // Camera position
            camera.position.z = 5;

            // Effect-specific setup
            let particles = [];
            let waves = [];
            let confetti = [];
            let animationId;
            let startTime = Date.now();

            const effectType = '${effect}';
            const effectColor = '${effectColor}';
            const intensity = ${intensity};
            const duration = ${duration};

            // Particle system
            function createParticles() {
              const geometry = new THREE.SphereGeometry(0.05, 8, 8);
              const material = new THREE.MeshBasicMaterial({ 
                color: effectColor,
                transparent: true,
                opacity: 0.8
              });

              for (let i = 0; i < 100 * intensity; i++) {
                const particle = new THREE.Mesh(geometry, material);
                particle.position.set(
                  (Math.random() - 0.5) * 10,
                  (Math.random() - 0.5) * 10,
                  (Math.random() - 0.5) * 10
                );
                particle.velocity = new THREE.Vector3(
                  (Math.random() - 0.5) * 0.02,
                  (Math.random() - 0.5) * 0.02,
                  (Math.random() - 0.5) * 0.02
                );
                particles.push(particle);
                scene.add(particle);
              }
            }

            // Wave system
            function createWaves() {
              const geometry = new THREE.PlaneGeometry(10, 10, 20, 20);
              const material = new THREE.MeshBasicMaterial({ 
                color: effectColor,
                wireframe: true,
                transparent: true,
                opacity: 0.6
              });

              for (let i = 0; i < 3; i++) {
                const wave = new THREE.Mesh(geometry, material);
                wave.position.z = -i * 2;
                wave.rotation.x = -Math.PI / 2;
                waves.push(wave);
                scene.add(wave);
              }
            }

            // Floating objects
            function createFloatingObjects() {
              const geometries = [
                new THREE.BoxGeometry(0.3, 0.3, 0.3),
                new THREE.SphereGeometry(0.2, 8, 8),
                new THREE.ConeGeometry(0.2, 0.4, 8)
              ];

              for (let i = 0; i < 15 * intensity; i++) {
                const geometry = geometries[Math.floor(Math.random() * geometries.length)];
                const material = new THREE.MeshBasicMaterial({ 
                  color: effectColor,
                  transparent: true,
                  opacity: 0.7
                });
                
                const object = new THREE.Mesh(geometry, material);
                object.position.set(
                  (Math.random() - 0.5) * 8,
                  (Math.random() - 0.5) * 8,
                  (Math.random() - 0.5) * 8
                );
                object.rotation.set(
                  Math.random() * Math.PI,
                  Math.random() * Math.PI,
                  Math.random() * Math.PI
                );
                object.velocity = new THREE.Vector3(
                  (Math.random() - 0.5) * 0.01,
                  (Math.random() - 0.5) * 0.01,
                  (Math.random() - 0.5) * 0.01
                );
                particles.push(object);
                scene.add(object);
              }
            }

            // Confetti system
            function createConfetti() {
              const geometry = new THREE.PlaneGeometry(0.1, 0.1);
              
              for (let i = 0; i < 50 * intensity; i++) {
                const material = new THREE.MeshBasicMaterial({ 
                  color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
                  transparent: true,
                  opacity: 0.8
                });
                
                const confetti = new THREE.Mesh(geometry, material);
                confetti.position.set(
                  (Math.random() - 0.5) * 10,
                  5,
                  (Math.random() - 0.5) * 10
                );
                confetti.velocity = new THREE.Vector3(
                  (Math.random() - 0.5) * 0.05,
                  -0.1 - Math.random() * 0.1,
                  (Math.random() - 0.5) * 0.05
                );
                confetti.rotation.set(
                  Math.random() * Math.PI,
                  Math.random() * Math.PI,
                  Math.random() * Math.PI
                );
                confetti.push(confetti);
                scene.add(confetti);
              }
            }

            // Initialize effect
            switch(effectType) {
              case 'particles':
                createParticles();
                break;
              case 'waves':
                createWaves();
                break;
              case 'floating':
                createFloatingObjects();
                break;
              case 'confetti':
                createConfetti();
                break;
              default:
                createParticles();
            }

            // Animation loop
            function animate() {
              animationId = requestAnimationFrame(animate);
              
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const fadeOut = 1 - progress;

              // Update particles
              particles.forEach(particle => {
                particle.position.add(particle.velocity);
                particle.rotation.x += 0.01;
                particle.rotation.y += 0.01;
                
                // Bounce off boundaries
                if (Math.abs(particle.position.x) > 5) particle.velocity.x *= -1;
                if (Math.abs(particle.position.y) > 5) particle.velocity.y *= -1;
                if (Math.abs(particle.position.z) > 5) particle.velocity.z *= -1;
                
                // Fade out over time
                if (particle.material.opacity > 0) {
                  particle.material.opacity = fadeOut * 0.8;
                }
              });

              // Update waves
              waves.forEach((wave, index) => {
                const time = Date.now() * 0.001;
                const positions = wave.geometry.attributes.position.array;
                
                for (let i = 0; i < positions.length; i += 3) {
                  const x = positions[i];
                  const y = positions[i + 1];
                  positions[i + 2] = Math.sin(x + time + index) * 0.5 * fadeOut;
                }
                
                wave.geometry.attributes.position.needsUpdate = true;
                wave.material.opacity = fadeOut * 0.6;
              });

              // Update confetti
              confetti.forEach(confetti => {
                confetti.position.add(confetti.velocity);
                confetti.rotation.x += 0.05;
                confetti.rotation.y += 0.05;
                confetti.rotation.z += 0.05;
                
                // Gravity effect
                confetti.velocity.y -= 0.002;
                
                // Fade out
                if (confetti.material.opacity > 0) {
                  confetti.material.opacity = fadeOut * 0.8;
                }
              });

              // Stop animation after duration
              if (progress >= 1) {
                cancelAnimationFrame(animationId);
                // Clean up
                particles.forEach(particle => scene.remove(particle));
                waves.forEach(wave => scene.remove(wave));
                confetti.forEach(confetti => scene.remove(confetti));
                particles = [];
                waves = [];
                confetti = [];
              }

              renderer.render(scene, camera);
            }

            // Start animation
            animate();

            // Cleanup function
            window.cleanup = function() {
              if (animationId) {
                cancelAnimationFrame(animationId);
              }
              particles.forEach(particle => scene.remove(particle));
              waves.forEach(wave => scene.remove(wave));
              confetti.forEach(confetti => scene.remove(confetti));
            };

            // Notify React Native that the WebView is loaded
            window.ReactNativeWebView.postMessage('loaded');
          </script>
        </body>
      </html>
    `;
  };

  const handleMessage = (event: any) => {
    if (event.nativeEvent.data === "loaded") {
      setIsLoaded(true);
      onLoad?.();
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(
          "window.cleanup && window.cleanup();"
        );
      }
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: generateThreeJSCode() }}
        style={styles.webview}
        onMessage={handleMessage}
        onLoad={handleLoad}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="always"
        allowsProtectedMedia={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

export default ThreeJSWebView;
