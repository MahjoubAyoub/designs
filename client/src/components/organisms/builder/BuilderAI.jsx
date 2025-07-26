import { useState } from 'react'
import { SectionTab } from 'polotno/side-panel'
import { Button, InputGroup, Spinner } from '@blueprintjs/core'
import { FiImage, FiLoader, FiStar } from 'react-icons/fi'
import axios from 'axios'

// Define the GenerateSection component for the Polotno side panel
const GenerateSection = ({ store }) => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [isAddingToCanvas, setIsAddingToCanvas] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)

  const handleGenerate = async () => {
    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) {
      alert('Please enter a valid prompt for the AI image.')
      return
    }
    if (trimmedPrompt.length < 3) {
      alert('Prompt is too short. Please provide a more detailed description.')
      return
    }
    if (isGenerating) {
      alert('Image generation in progress. Please wait.')
      return
    }
    if (!import.meta.env.VITE_STABILITY_AI_API_KEY) {
      alert('API key is missing. Please configure VITE_STABILITY_AI_API_KEY in your environment.')
      return
    }

    setIsGenerating(true)
    setGeneratedImage(null)
    setAddSuccess(false)

    try {
      const API_ENDPOINT =
        import.meta.env.VITE_STABILITY_AI_ENDPOINT ||
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image'
      const response = await axios.post(
        API_ENDPOINT,
        {
          text_prompts: [{ text: trimmedPrompt }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 30,
          samples: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_STABILITY_AI_API_KEY}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      )

      if (!response.data?.artifacts?.length || !response.data.artifacts[0].base64) {
        throw new Error('Invalid API response: No image data returned.')
      }

      const imageUrl = `data:image/png;base64,${response.data.artifacts[0].base64}`
      setGeneratedImage(imageUrl)
    } catch (error) {
      const errorMessage =
        error.response?.status === 429
          ? 'Rate limit exceeded. Please wait a moment before trying again.'
          : error.response?.data?.message ||
            error.message ||
            'Failed to generate AI image. Please check your prompt or API configuration.'
      console.error('Error generating AI image:', errorMessage, error)
      alert(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddToCanvas = async () => {
    if (!store.activePage || !generatedImage) {
      alert(
        'No active page or image available. Please generate an image and ensure a canvas page is selected.',
      )
      return
    }

    setIsAddingToCanvas(true)
    try {
      store.activePage.addElement({
        type: 'image',
        x: 50,
        y: 50,
        width: 1024,
        height: 1024,
        src: generatedImage,
      })
      setAddSuccess(true)
    } catch (error) {
      console.error('Error adding image to canvas:', error)
      alert('Failed to add image to canvas.')
    } finally {
      setIsAddingToCanvas(false)
    }
  }

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <FiImage size="20" />
        <h3 style={{ fontSize: '18px', fontWeight: '600' }}>AI Image Generator</h3>
      </div>
      <InputGroup
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter image prompt (e.g., 'A futuristic city at sunset')"
        disabled={isGenerating}
        style={{ marginBottom: '10px' }}
      />
      <Button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        intent="primary"
        style={{ marginBottom: '10px' }}
      >
        {isGenerating ? (
          <>
            <Spinner size={16} style={{ marginRight: '8px' }} />
            Generating...
          </>
        ) : (
          <>Generate Image</>
        )}
      </Button>

      {isGenerating && (
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            background: '#f9fafb',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Spinner size={32} />
          <p style={{ fontSize: '14px', color: '#4b5563', textAlign: 'center' }}>
            Creating your image...
          </p>
        </div>
      )}

      {generatedImage && !isGenerating && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
            <img
              src={generatedImage}
              style={{ width: '100%', height: 'auto' }}
              alt="Generated AI image"
            />
          </div>
          <Button
            onClick={handleAddToCanvas}
            intent={addSuccess ? 'none' : 'primary'}
            disabled={isAddingToCanvas}
            style={{ marginBottom: '10px' }}
            aria-busy={isAddingToCanvas}
            aria-label="Add image to canvas"
          >
            {isAddingToCanvas ? (
              <>
                <Spinner size={16} style={{ marginRight: '8px' }} />
                Adding to Canvas...
              </>
            ) : (
              'Add to Canvas'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

// Define the Polotno custom section
export const AiGeneratorSection = {
  name: 'ai-generator',
  Tab: (props) => (
    <SectionTab name="AI Generator" {...props}>
      <span className="inline-block">
        <FiImage size="1.4rem" />
      </span>
    </SectionTab>
  ),
  Panel: GenerateSection,
}
