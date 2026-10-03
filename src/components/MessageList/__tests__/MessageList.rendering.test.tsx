import { Text } from 'react-native';
import { ThemeProvider } from '@unif/react-native-design';
import { render, screen } from '@testing-library/react-native';
import { describe, expect, jest, test } from '@jest/globals';
import { MessageList } from '../../../index';

interface Item {
  id: string;
  text: string;
}

const makeItems = (count: number): Item[] =>
  Array.from({ length: count }, (_, index) => ({
    id: String(index),
    text: `Message ${index}`,
  }));

describe('MessageList render isolation', () => {
  test('unchanged public inputs do not revisit keys or visible row renderers', () => {
    const items = makeItems(1000);
    const keyExtractor = jest.fn((item: Item) => item.id);
    const renderItem = jest.fn((item: Item) => <Text>{item.text}</Text>);
    const props = { items, keyExtractor, renderItem };
    const view = render(<MessageList {...props} />, { wrapper: ThemeProvider });
    expect(screen.getByText('Message 0')).toBeOnTheScreen();
    keyExtractor.mockClear();
    renderItem.mockClear();

    view.rerender(<MessageList {...props} />);

    expect(keyExtractor).not.toHaveBeenCalled();
    expect(renderItem).not.toHaveBeenCalled();
  });

  test('streaming a visible item updates its content without rendering its peers', () => {
    const items = makeItems(3);
    const keyExtractor = (item: Item) => item.id;
    const renderItem = jest.fn((item: Item) => <Text>{item.text}</Text>);
    const view = render(
      <MessageList
        items={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />,
      { wrapper: ThemeProvider }
    );
    renderItem.mockClear();

    view.rerender(
      <MessageList
        items={[items[0]!, { id: '1', text: 'Streaming reply' }, items[2]!]}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
    );

    expect(screen.getByText('Streaming reply')).toBeOnTheScreen();
    expect(renderItem.mock.calls.map(([item]) => item.id)).toEqual(['1']);
  });

  test('an offscreen update does not render unchanged visible rows', () => {
    const items = makeItems(1000);
    const keyExtractor = (item: Item) => item.id;
    const renderItem = jest.fn((item: Item) => <Text>{item.text}</Text>);
    const view = render(
      <MessageList
        items={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />,
      { wrapper: ThemeProvider }
    );
    renderItem.mockClear();

    view.rerender(
      <MessageList
        items={items.map((item, index) =>
          index === 999 ? { ...item, text: 'Updated' } : item
        )}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
    );

    expect(screen.getByText('Message 0')).toBeOnTheScreen();
    expect(renderItem).not.toHaveBeenCalled();
  });

  test('extraData refreshes external row and separator dependencies', () => {
    const items = makeItems(2);
    let language = 'first';
    const keyExtractor = (item: Item) => item.id;
    const renderItem = (item: Item) => <Text>{`${language}:${item.id}`}</Text>;
    const renderSeparator = () => <Text>{`${language}:separator`}</Text>;
    const props = { items, keyExtractor, renderItem, renderSeparator };
    const view = render(<MessageList {...props} extraData={language} />, {
      wrapper: ThemeProvider,
    });
    language = 'second';

    view.rerender(<MessageList {...props} extraData={language} />);

    expect(screen.getByText('second:0')).toBeOnTheScreen();
    expect(screen.getByText('second:1')).toBeOnTheScreen();
    expect(screen.getByText('second:separator')).toBeOnTheScreen();
    expect(screen.queryByText('first:0')).toBeNull();
  });

  test('a changed renderer refreshes unchanged items', () => {
    const items = makeItems(2);
    const keyExtractor = (item: Item) => item.id;
    const view = render(
      <MessageList
        items={items}
        keyExtractor={keyExtractor}
        renderItem={(item) => <Text>{item.text}</Text>}
      />,
      { wrapper: ThemeProvider }
    );

    view.rerender(
      <MessageList
        items={items}
        keyExtractor={keyExtractor}
        renderItem={(item) => <Text>{`New renderer ${item.id}`}</Text>}
      />
    );

    expect(screen.getByText('New renderer 0')).toBeOnTheScreen();
    expect(screen.getByText('New renderer 1')).toBeOnTheScreen();
  });

  test('a separator sees a changed predecessor even when its own row is unchanged', () => {
    const items = makeItems(3);
    const keyExtractor = (item: Item) => item.id;
    const renderItem = (item: Item) => <Text>{item.id}</Text>;
    const renderSeparator = (previous: Item, next: Item) => (
      <Text>{`${previous.text} → ${next.text}`}</Text>
    );
    const props = { keyExtractor, renderItem, renderSeparator };
    const view = render(<MessageList {...props} items={items} />, {
      wrapper: ThemeProvider,
    });

    view.rerender(
      <MessageList
        {...props}
        items={[items[0]!, { id: '1', text: 'Changed' }, items[2]!]}
      />
    );

    expect(screen.getByText('Message 0 → Changed')).toBeOnTheScreen();
    expect(screen.getByText('Changed → Message 2')).toBeOnTheScreen();
  });

  test('prepend and reorder refresh row indices and separator neighbors', () => {
    const items = makeItems(2);
    const keyExtractor = (item: Item) => item.id;
    const renderItem = (item: Item, index: number) => (
      <Text>{`${item.id}:${index}`}</Text>
    );
    const renderSeparator = (previous: Item, next: Item) => (
      <Text>{`${previous.id}/${next.id}`}</Text>
    );
    const props = { keyExtractor, renderItem, renderSeparator };
    const view = render(<MessageList {...props} items={items} />, {
      wrapper: ThemeProvider,
    });
    const earlier = { id: 'earlier', text: 'History' };

    view.rerender(<MessageList {...props} items={[earlier, ...items]} />);
    expect(screen.getByText('0:1')).toBeOnTheScreen();
    expect(screen.getByText('1:2')).toBeOnTheScreen();
    expect(screen.getByText('earlier/0')).toBeOnTheScreen();

    view.rerender(<MessageList {...props} items={[items[1]!, items[0]!]} />);
    expect(screen.getByText('1:0')).toBeOnTheScreen();
    expect(screen.getByText('0:1')).toBeOnTheScreen();
    expect(screen.getByText('1/0')).toBeOnTheScreen();
    expect(screen.queryByText('earlier/0')).toBeNull();
  });
});
