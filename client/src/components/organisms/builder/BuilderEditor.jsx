import React from 'react'
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

const store = createStore({
  key: 'nFA5H9elEytDyPyvKL7T',
  showCredit: true,
})
store.addPage()
store.setSize(1024, 1024)

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

const PolotnoEditor = () => {
  return (
    <PolotnoContainer style={{ width: '100%', height: '100vh' }}>
      <SidePanelWrap>
        <SidePanel store={store} sections={sections} defaultSection="size" />
      </SidePanelWrap>
      <WorkspaceWrap>
        <Toolbar store={store} downloadButtonEnabled />
        <Workspace store={store} components={{ PageControls }} />
        <ZoomButtons store={store} />
        <PagesTimeline store={store} />
      </WorkspaceWrap>
    </PolotnoContainer>
  )
}

export default PolotnoEditor
