import React, { useState } from 'react';
import { Popover, Menu, MenuItem, Button, Position } from '@blueprintjs/core';
import { Media, Document, Code, ImageRotateLeft, Import, Download } from '@blueprintjs/icons';
import PptxGenJS from 'pptxgenjs';
import { exportDesignAsJson } from '../../../api/designs.js';

const CustomDownloadButton = ({ store, designId }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async (type) => {
    setLoading(true);
    try {
      switch (type) {
        case 'png':
          await store.saveAsImage({ fileName: 'export.png' });
          break;
        case 'jpg':
          await store.saveAsImage({ mimeType: 'image/jpeg', fileName: 'export.jpg' });
          break;
        case 'pdf':
          await store.saveAsPDF({ fileName: 'export.pdf' });
          break;
        case 'svg':
          await store.saveAsSVG();
          break;
        case 'gif':
          await store.saveAsGIF();
          break;
        case 'html':
          await store.saveAsHTML();
          break;
        case 'pptx': {
          // Create a new PowerPoint presentation
          const pptx = new PptxGenJS();
          
          // For each page in the store, create a slide
          for (const page of store.pages) {
            // Create a new slide
            const slide = pptx.addSlide();
            
            // Export the page as an image
            const dataUrl = await page.toDataURL();
            
            // Add the image to the slide
            slide.addImage({ 
              data: dataUrl, 
              x: 0, 
              y: 0, 
              w: '100%', 
              h: '100%' 
            });
          }
          
          // Save the presentation
          await pptx.writeFile({ fileName: 'export.pptx' });
          break;
        }
        case 'blob': {
          const blob = await store.toBlob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'export.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          break;
        }
        case 'dataurl': {
          const dataUrl = await store.toPDFDataURL();
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = 'export.pdf';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          break;
        }
        case 'json': {
          if (!designId) {
            alert('Design must be saved before exporting as JSON');
            return;
          }
          try {
            const exportData = await exportDesignAsJson(designId);
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${exportData.design.name || 'design'}_export.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } catch (error) {
            console.error('JSON export failed:', error);
            alert('Failed to export design as JSON');
          }
          break;
        }
        default:
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    Popover,
    {
      content: React.createElement(
        Menu,
        null,
        [
          React.createElement(MenuItem, { icon: React.createElement(Media), text: 'Export PNG', onClick: () => handleExport('png'), key: 'png' }),
          React.createElement(MenuItem, { icon: React.createElement(Media), text: 'Export JPG', onClick: () => handleExport('jpg'), key: 'jpg' }),
          React.createElement(MenuItem, { icon: React.createElement(Document), text: 'Export PDF', onClick: () => handleExport('pdf'), key: 'pdf' }),
          React.createElement(MenuItem, { icon: React.createElement(Code), text: 'Export SVG', onClick: () => handleExport('svg'), key: 'svg' }),
          React.createElement(MenuItem, { icon: React.createElement(Media), text: 'Export GIF', onClick: () => handleExport('gif'), key: 'gif' }),
          React.createElement(MenuItem, { icon: React.createElement(Code), text: 'Export HTML', onClick: () => handleExport('html'), key: 'html' }),
          React.createElement(MenuItem, { icon: React.createElement(Document), text: 'Export PowerPoint', onClick: () => handleExport('pptx'), key: 'pptx' }),
          React.createElement(MenuItem, { icon: React.createElement(ImageRotateLeft), text: 'Export Blob', onClick: () => handleExport('blob'), key: 'blob' }),
          React.createElement(MenuItem, { icon: React.createElement(Import), text: 'Export PDF DataURL', onClick: () => handleExport('dataurl'), key: 'dataurl' }),
          React.createElement(MenuItem, { icon: React.createElement(Download), text: 'Export JSON', onClick: () => handleExport('json'), key: 'json' }),
        ]
      ),
      position: Position.BOTTOM
    },
    React.createElement(Button, { icon: React.createElement(Import), text: 'Download', minimal: true, loading })
  );
};

export default CustomDownloadButton;
