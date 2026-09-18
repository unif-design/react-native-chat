import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import { ChatDemo } from '../demos/ChatDemo';
import { LiveDemo } from '../components/LiveDemo';
import { ComponentCatalog } from '../components/ComponentCatalog';

export default function Home() {
  return (
    <Layout
      title="独立、可组合的聊天组件"
      description="基于 Unif Design 的 React Native 聊天组件。探索真实交互示例、公开 API 与主聊天和抽屉组合。"
    >
      <main className="chat-home">
        <section className="chat-hero">
          <div className="chat-hero-copy">
            <p className="chat-eyebrow">UNIF · REACT NATIVE</p>
            <h1>
              从一条消息，
              <br />
              到完整对话。
            </h1>
            <p className="chat-hero-description">
              为你的应用组合聊天界面。
              <br />
              消息、输入、附件与交互反馈，延续熟悉的 Unif Design 体验。
            </p>
            <div className="chat-hero-actions">
              <Link
                className="button button--primary"
                to="/docs/getting-started"
              >
                开始使用 <span aria-hidden>→</span>
              </Link>
              <Link
                className="button button--secondary button--outline"
                to="/docs/components"
              >
                浏览组件
              </Link>
            </div>
            <div className="chat-install">
              <CodeBlock language="bash">
                npm install @unif/react-native-chat
              </CodeBlock>
            </div>
            <div className="chat-hero-meta">
              <span>React Native</span>
              <span>Web 交互预览</span>
              <span>TypeScript</span>
            </div>
          </div>
          <div className="chat-hero-preview">
            <LiveDemo title="试着发送一条消息">
              <ChatDemo />
            </LiveDemo>
          </div>
        </section>
        <section className="chat-home-components">
          <div className="chat-section-intro">
            <p className="chat-eyebrow">COMPONENTS</p>
            <h2>按需要，组成你的聊天体验</h2>
            <p>
              每个组件都能独立使用，从一个输入框开始，也能逐步搭建完整会话。
            </p>
          </div>
          <ComponentCatalog />
        </section>
        <section className="chat-composition-links">
          <div>
            <p className="chat-eyebrow">COMPOSITION</p>
            <h2>放进真实页面中</h2>
            <p>查看宿主、草稿、附件与事件如何组合。</p>
          </div>
          <Link to="/docs/composition/main-chat">
            <strong>主聊天</strong>
            <span>消息列表 + 输入 + 附件 →</span>
          </Link>
          <Link to="/docs/composition/drawer-input">
            <strong>抽屉输入</strong>
            <span>独立输入区 + 附件 →</span>
          </Link>
        </section>
      </main>
    </Layout>
  );
}
