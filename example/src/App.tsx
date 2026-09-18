import { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider } from '@unif/react-native-design';
import type { ColorScheme } from '@unif/react-native-design';
import { ExampleGallery } from './ExampleGallery/ExampleGallery';
import { styles } from './styles';
export default function App() {
  const [scheme, setScheme] = useState<ColorScheme>('light');
  const [fontScale, setFontScale] = useState(1);
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider forceScheme={scheme} fontScale={fontScale}>
          <SafeAreaView style={styles.root}>
            <ExampleGallery
              onToggleTheme={() =>
                setScheme((current) => (current === 'light' ? 'dark' : 'light'))
              }
              onToggleFont={() =>
                setFontScale((current) => (current === 1 ? 1.5 : 1))
              }
            />
          </SafeAreaView>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
