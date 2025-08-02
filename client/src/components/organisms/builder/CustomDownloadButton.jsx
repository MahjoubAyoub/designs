import React, { useState } from 'react';
import { Popover, Menu, MenuItem, Button, Position } from '@blueprintjs/core';
import { Media, Document, Code, ImageRotateLeft, Import } from '@blueprintjs/icons';

const CustomDownloadButton = ({ store }) => {
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
          React.createElement(MenuItem, { icon: React.createElement(ImageRotateLeft), text: 'Export Blob', onClick: () => handleExport('blob'), key: 'blob' }),
          React.createElement(MenuItem, { icon: React.createElement(Import), text: 'Export PDF DataURL', onClick: () => handleExport('dataurl'), key: 'dataurl' }),
        ]
      ),
      position: Position.BOTTOM
    },
    React.createElement(Button, { icon: React.createElement(Import), text: 'Download', minimal: true, loading })
  );
};

export default CustomDownloadButton;
