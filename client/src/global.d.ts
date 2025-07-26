import type { IStaticMethods } from 'preline/dist'

declare global {
  interface Window {
    // Optional third-party libraries
    _
    // Preline UI
    HSStaticMethods: IStaticMethods
  }
}

export {}
