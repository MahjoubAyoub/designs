import React, { useEffect } from 'react'
import CustomDownloadButton from './CustomDownloadButton';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno'
import { Toolbar } from 'polotno/toolbar/toolbar'
import { PagesTimeline } from 'polotno/pages-timeline'
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons'
import {
  SidePanel,
  TextSection,
  SizeSection,
  LayersSection,
  ElementsSection,
  TemplatesSection,
} from 'polotno/side-panel'
import { Workspace } from 'polotno/canvas/workspace'
import { createStore } from 'polotno/model/store'
import { PageControls } from './BuilderControls'
// Custom Sections
import { DrawSection } from './BuilderDraw'
import { MediaSection } from './BuilderMedia'
import { AiGeneratorSection } from './BuilderAI'

// Accept width and height as props (from BuilderLayout) and storeRef for parent access
const PolotnoEditor = ({ width = 1024, height = 1024, storeRef, onAutoSave, initialData } = {}) => {
  const store = createStore({
    key: 'nFA5H9elEytDyPyvKL7T',
    showCredit: true,
  })
  store.addPage()
  store.setSize(width, height)
  if (storeRef && typeof storeRef === 'object') {
    storeRef.current = store
  }

  // Load initial data if provided
  useEffect(() => {
    if (initialData) {
      store.loadJSON(initialData)
    }
  }, [initialData])

  // Autosave on every change (throttled)
  useEffect(() => {
    if (!onAutoSave) return;
    let timeout;
    const unsub = store.on('change', () => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const json = store.toJSON();
        await onAutoSave(json);
      }, 2000); // Save 2s after last change
    });
    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, [store, onAutoSave]);

  const sections = [
    SizeSection,
    TextSection,
    ElementsSection,
    MediaSection,
    DrawSection,
    LayersSection,
    TemplatesSection,
    AiGeneratorSection,
  ]

  return React.createElement(
    PolotnoContainer,
    { style: { width: '100%', height: '100vh' } },
    [
      React.createElement(
        SidePanelWrap,
        { key: 'sidepanelwrap' },
        React.createElement(SidePanel, {
          store,
          sections,
          defaultSection: 'size',
          key: 'sidepanel',
        })
      ),
      React.createElement(
        WorkspaceWrap,
        { key: 'workspacewrap' },
        [
          React.createElement(Toolbar, {
            store,
            components: { ActionControls: CustomDownloadButton },
            key: 'toolbar',
          }),
          React.createElement(Workspace, {
            store,
            components: { PageControls },
            key: 'workspace',
          }),
          React.createElement(ZoomButtons, {
            store,
            key: 'zoombuttons',
          }),
          React.createElement(PagesTimeline, {
            store,
            key: 'pagestimeline',
          }),
        ]
      ),
    ]
  )
}

export default PolotnoEditor
