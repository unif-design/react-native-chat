import Link from '@docusaurus/Link';
import { COMPONENTS } from './constants';

export function ComponentCatalog() {
  return (
    <div className="chat-component-grid">
      {COMPONENTS.map((component) => (
        <Link
          key={component.name}
          to={component.path}
          className="chat-component-link"
        >
          <div className="chat-component-title">
            <strong>{component.name}</strong>
            <span aria-hidden>↗</span>
          </div>
          <span className="chat-component-label">{component.label}</span>
          <p>{component.description}</p>
        </Link>
      ))}
    </div>
  );
}
