import { expect, jest, test } from '@jest/globals';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { ThemeProvider, r } from '@unif/react-native-design';
import { Process } from '@unif/react-native-chat';

test('紧凑身份与当前状态同一行，状态文案由调用者表达且不改变折叠事件', () => {
  const page = render(
    <ThemeProvider>
      <Process
        variant="compact"
        identityPlacement="inline"
        identity={<Text testID="identity">智能小U</Text>}
        steps={[
          {
            id: 'reasoning',
            title: '智能小U',
            status: 'completed',
            statusText: '已思考',
            details: <Text>公开说明</Text>,
          },
        ]}
      />
    </ThemeProvider>
  );
  expect(page.getAllByText('智能小U')).toHaveLength(1);
  expect(page.getByRole('button', { name: '智能小U，已思考' })).toBeTruthy();
  expect(page.queryByText('已完成')).toBeNull();
  fireEvent.press(page.getByRole('button', { name: '智能小U，已思考' }));
  expect(page.getByText('公开说明')).toBeTruthy();
});

test('紧凑过程用整行展开真实详情，流式更新与终态不丢失展开选择', () => {
  const content = (message: string, completed = false) => (
    <ThemeProvider>
      <Process
        variant="compact"
        steps={[
          {
            id: 'progress',
            title: '公开处理过程',
            status: completed ? 'completed' : 'running',
            details: <Text>{message}</Text>,
          },
        ]}
      />
    </ThemeProvider>
  );
  const page = render(content('第一条公开说明'));
  expect(page.queryByText('第一条公开说明')).toBeNull();
  fireEvent.press(page.getByRole('button', { name: '公开处理过程，处理中' }));
  expect(page.getByText('第一条公开说明')).toBeTruthy();
  page.rerender(content('第二条公开说明'));
  expect(page.getByText('第二条公开说明')).toBeTruthy();
  page.rerender(content('第二条公开说明', true));
  expect(page.getByText('第二条公开说明')).toBeTruthy();
  fireEvent.press(page.getByRole('button', { name: '公开处理过程，已完成' }));
  expect(page.queryByText('第二条公开说明')).toBeNull();
});

test('紧凑过程有界滚动，受控展开仅交事件，无详情不提供折叠操作', () => {
  const changed = jest.fn();
  const content = (expanded: readonly string[]) => (
    <ThemeProvider>
      <Process
        variant="compact"
        expandedIds={expanded}
        onExpandedChange={changed}
        steps={[
          {
            id: 'detail',
            title: '公开说明',
            status: 'running',
            details: <Text>真实说明</Text>,
          },
          { id: 'waiting', title: '等待数据', status: 'pending' },
        ]}
      />
    </ThemeProvider>
  );
  const page = render(content([]));
  fireEvent.press(page.getByRole('button', { name: '公开说明，处理中' }));
  expect(changed).toHaveBeenCalledWith(['detail']);
  expect(page.queryByText('真实说明')).toBeNull();
  page.rerender(content(['detail']));
  expect(page.getByText('真实说明')).toBeTruthy();
  expect(page.getByTestId('process-step-detail-details')).toHaveStyle({
    maxHeight: r(180),
  });
  expect(page.queryByRole('button', { name: /等待数据/ })).toBeNull();
});

test('紧凑停止动作有独立44触达，点击只交动作不切换过程详情', () => {
  const stop = jest.fn();
  const changed = jest.fn();
  const page = render(
    <ThemeProvider>
      <Process
        variant="compact"
        onExpandedChange={changed}
        steps={[
          {
            id: 't',
            title: '公开过程',
            status: 'running',
            details: <Text>公开说明</Text>,
            actions: [{ id: 'stop', label: '停止', onPress: stop }],
          },
        ]}
      />
    </ThemeProvider>
  );
  const button = page.getByRole('button', { name: '停止' });
  expect(button).toHaveStyle({ minWidth: 44, minHeight: 44 });
  fireEvent.press(button);
  expect(stop).toHaveBeenCalledTimes(1);
  expect(changed).not.toHaveBeenCalled();
  expect(page.queryByText('公开说明')).toBeNull();
});
