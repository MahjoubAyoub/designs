// Helper to render the PolotnoEditor React component from Vue without JSX in Vue
export async function renderPolotnoEditor(container, width, height, { onAutoSave, initialData } = {}) {
  await import('@blueprintjs/core/lib/css/blueprint.css')
  const React = await import('react')
  const ReactDOM = await import('react-dom/client')
  const PolotnoEditor = (await import('./BuilderEditor.js')).default
  let storeRef = { current: null }
  // Patch: pass a ref to get the store instance
  const root = ReactDOM.createRoot(container)
  root.render(React.createElement(PolotnoEditor, { width, height, storeRef, onAutoSave, initialData }))
  // Wait a tick to ensure storeRef is set
  await new Promise(r => setTimeout(r, 100))
  return storeRef.current
}
