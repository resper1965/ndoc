/**
 * Common types to replace 'any' usage
 */

/**
 * Generic object type for component props
 */
export type ComponentProps = Record<string, unknown>;

/**
 * React element props type
 */
export type ReactElementProps = {
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
};

/**
 * Style object type
 */
export type StyleObject = Record<string, string | number>;

/**
 * Position type for popover/positioned elements
 */
export type Position = {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  transform?: string;
};

/**
 * Arrow styles type
 */
export type ArrowStyles = {
  position?: 'absolute' | 'relative' | 'fixed';
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  transform?: string;
  width?: string | number;
  height?: string | number;
  [key: string]: string | number | undefined;
};

/**
 * Tab refs type
 */
export type TabRefs = Record<string, React.RefObject<HTMLButtonElement>>;

/**
 * Type class name (for CSS classes)
 */
export type TypeClassName = string | string[] | Record<string, boolean> | undefined;

