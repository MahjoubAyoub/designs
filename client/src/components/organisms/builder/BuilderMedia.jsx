import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { SectionTab } from 'polotno/side-panel'
import { MdPhoto } from 'react-icons/md'
import { PhotosSection, UploadSection, BackgroundSection } from 'polotno/side-panel'

const tabs = [
  { id: 'upload', label: 'Upload', isActive: true },
  { id: 'photo', label: 'Photos', isActive: false },
  { id: 'bg', label: 'Backgrounds', isActive: false },
]

const CombinedMediaPanel = observer(({ store }) => {
  useEffect(() => {
    // Initialize Preline tabs after render
    const timeout = setTimeout(() => {
      if (window?.HSStaticMethods?.autoInit) {
        window.HSStaticMethods.autoInit()
      }
    }, 50)
    return () => clearTimeout(timeout)
  }, [])
  return (
    <div className="h-full">
      {/* Controllers */}
      <nav className="flex" aria-label="Tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`py-10 px-5 flex-1 border-b-2 border-gray-100 hs-tab-active:border-primary ${tab.isActive ? 'active' : ''}`}
            aria-selected={tab.isActive}
            data-hs-tab={`#media-${tab.id}`}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {/* Panels */}
      <div className="p-20 overflow-auto" data-hs-tab-content>
        <div id="media-upload" role="tabpanel">
          <UploadSection.Panel store={store} />
        </div>
        <div
          id="media-photo"
          className="hidden"
          role="tabpanel"
          aria-labelledby="unstyled-tabs-item-2"
        >
          <PhotosSection.Panel store={store} />
        </div>
        <div
          id="media-bg"
          className="hidden"
          role="tabpanel"
          aria-labelledby="unstyled-tabs-item-3"
        >
          <BackgroundSection.Panel store={store} />
        </div>
      </div>
    </div>
  )
})

export const MediaSection = {
  name: 'media',
  Tab: (props) => (
    <SectionTab name="Media" {...props}>
      <span className="inline-block">
        <MdPhoto size="1.4rem" />
      </span>
    </SectionTab>
  ),
  Panel: CombinedMediaPanel,
}
