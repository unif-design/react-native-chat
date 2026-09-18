import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, useTheme, useThemedStyles } from '@unif/react-native-design';
import { DesignExample } from '../DesignExample/DesignExample';
import { ComposerExample } from '../examples/ComposerExample/ComposerExample';
import { AttachmentsExample } from '../examples/AttachmentsExample/AttachmentsExample';
import { MessageExample } from '../examples/MessageExample/MessageExample';
import { MessageListExample } from '../examples/MessageListExample/MessageListExample';
import { SuggestionsExample } from '../examples/SuggestionsExample/SuggestionsExample';
import { ConfirmationExample } from '../examples/ConfirmationExample/ConfirmationExample';
import { ProcessExample } from '../examples/ProcessExample/ProcessExample';
import { SourcesExample } from '../examples/SourcesExample/SourcesExample';
import { CitationExample } from '../examples/CitationExample/CitationExample';
import { FeedbackExample } from '../examples/FeedbackExample/FeedbackExample';
import { ChatExample } from '../examples/ChatExample/ChatExample';
import { MainChatExample } from '../examples/MainChatExample/MainChatExample';
import { DrawerInputExample } from '../examples/DrawerInputExample/DrawerInputExample';
import { EXAMPLES } from './constants';
import { createStyles } from './styles';
import type { ExampleGalleryProps, ExampleName } from './types';

function renderExample(name: ExampleName) {
  switch (name) {
    case 'design':
      return <DesignExample />;
    case 'composer':
      return <ComposerExample />;
    case 'attachments':
      return <AttachmentsExample />;
    case 'message':
      return <MessageExample />;
    case 'messageList':
      return <MessageListExample />;
    case 'suggestions':
      return <SuggestionsExample />;
    case 'confirmation':
      return <ConfirmationExample />;
    case 'process':
      return <ProcessExample />;
    case 'sources':
      return <SourcesExample />;
    case 'citation':
      return <CitationExample />;
    case 'feedback':
      return <FeedbackExample />;
    case 'chat':
      return <ChatExample />;
    case 'mainChat':
      return <MainChatExample />;
    case 'drawer':
      return <DrawerInputExample />;
  }
}

export function ExampleGallery({
  onToggleTheme,
  onToggleFont,
}: ExampleGalleryProps) {
  const [selected, setSelected] = useState<ExampleName>('design');
  const styles = useThemedStyles(createStyles);
  const { scheme, fontScale } = useTheme();
  return (
    <View style={styles.root}>
      <View style={styles.settings}>
        <Button
          label={scheme === 'light' ? '切换深色' : '切换浅色'}
          variant="text"
          onPress={onToggleTheme}
        />
        <Button
          label={fontScale === 1 ? '切换大字号' : '恢复字号'}
          variant="text"
          onPress={onToggleFont}
        />
      </View>
      <ScrollView
        horizontal
        style={styles.menu}
        contentContainerStyle={styles.menuContent}
        keyboardShouldPersistTaps="handled"
      >
        {EXAMPLES.map((example) => (
          <Button
            key={example.id}
            label={example.label}
            variant={selected === example.id ? 'primary' : 'secondary'}
            onPress={() => setSelected(example.id)}
          />
        ))}
      </ScrollView>
      <View style={styles.content} key={selected}>
        {renderExample(selected)}
      </View>
    </View>
  );
}
