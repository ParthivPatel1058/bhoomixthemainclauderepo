import React from 'react';
import { createAvatar } from '@bible-strong/avatar-react';
import avatarDefinition from './unknown.avatar.json';

/**
 * The assistant's face, built once from the exported avatar definition.
 *
 * `createAvatar` is called at module scope on purpose: it validates the
 * definition and builds the component, which is wasted work on every render.
 */
const AvatarCore = createAvatar(avatarDefinition);

type AvatarCoreProps = React.ComponentProps<typeof AvatarCore>;

export interface DynamicAvatarProps {
  size?: number | string;
  /** Animation key from the definition, e.g. 'idle' | 'thinking' | 'listening'. */
  animation?: AvatarCoreProps['animation'];
  /** Expression key from the definition; takes precedence over `animation`. */
  expression?: AvatarCoreProps['expression'];
  className?: string;
}

export const DynamicAvatar: React.FC<DynamicAvatarProps> = ({
  size = 36,
  animation = 'idle',
  expression,
  className = '',
}) => (
  <div
    className={`inline-flex items-center justify-center select-none ${className}`}
    aria-hidden="true"
  >
    {expression ? (
      <AvatarCore size={size} expression={expression} />
    ) : (
      <AvatarCore size={size} animation={animation} />
    )}
  </div>
);
