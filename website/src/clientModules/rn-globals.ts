if (typeof window !== 'undefined' && !('global' in window)) {
  Object.assign(window, { global: window });
}
export default {};
