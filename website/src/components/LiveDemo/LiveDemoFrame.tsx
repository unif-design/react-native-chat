import { useState } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@unif/react-native-design';
import { DEMO_METRICS } from './constants';
import { styles } from './styles';
import type { LiveDemoProps } from './types';
export function LiveDemoFrame({
  children,
  height,
  title = '实时预览',
  toolbar = true,
}: LiveDemoProps) {
  const { colorMode } = useColorMode();
  const [fontScale, setFontScale] = useState(1);
  const [revision, setRevision] = useState(0);
  return (
    <div className="chat-live-demo">
      {toolbar ? (
        <div className="chat-demo-toolbar">
          <span>{title}</span>
          <div className="chat-demo-tools">
            <button
              type="button"
              aria-label="切换示例字号"
              aria-pressed={fontScale !== 1}
              onClick={() =>
                setFontScale((current) => (current === 1 ? 1.5 : 1))
              }
            >
              Aa <span>{fontScale}×</span>
            </button>
            <button
              type="button"
              onClick={() => setRevision((current) => current + 1)}
            >
              重置
            </button>
          </div>
        </div>
      ) : null}
      <div className="chat-demo-stage" style={height ? { height } : undefined}>
        <ThemeProvider
          forceScheme={colorMode === 'dark' ? 'dark' : 'light'}
          fontScale={fontScale}
        >
          <GestureHandlerRootView
            style={[styles.host, height !== undefined && styles.bounded]}
          >
            <SafeAreaProvider
              initialMetrics={DEMO_METRICS}
              style={height !== undefined ? styles.bounded : styles.host}
              key={revision}
            >
              {children}
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </ThemeProvider>
      </div>
    </div>
  );
}
