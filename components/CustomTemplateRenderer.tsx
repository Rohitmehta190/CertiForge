"use client";

interface CustomTemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  content: string;
  position: { x: number; y: number };
  style: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    width?: number;
    height?: number;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
  };
}

interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
  };
  elements: CustomTemplateElement[];
}

interface CustomTemplateRendererProps {
  template: CustomTemplate;
  certificateData: {
    name: string;
    course: string;
    date: string;
    certificateId: string;
  };
}

export default function CustomTemplateRenderer({ 
  template, 
  certificateData 
}: CustomTemplateRendererProps) {
  // Replace dynamic content
  const processContent = (content: string) => {
    return content
      .replace(/\{\{name\}\}/g, certificateData.name)
      .replace(/\{\{course\}\}/g, certificateData.course)
      .replace(/\{\{date\}\}/g, certificateData.date)
      .replace(/\{\{certificateId\}\}/g, certificateData.certificateId);
  };

  const renderElement = (element: CustomTemplateElement) => {
    const processedContent = processContent(element.content);

    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            style={{
              position: 'absolute',
              left: `${element.position.x}px`,
              top: `${element.position.y}px`,
              width: `${element.style.width}px`,
              height: `${element.style.height}px`,
              fontSize: `${element.style.fontSize}px`,
              fontFamily: element.style.fontFamily,
              color: element.style.color,
              fontWeight: element.style.fontWeight,
              textAlign: element.style.textAlign,
              display: 'flex',
              alignItems: 'center',
              justifyContent: element.style.textAlign === 'center' ? 'center' : 
                           element.style.textAlign === 'right' ? 'flex-end' : 'flex-start',
              padding: '4px'
            }}
          >
            {processedContent}
          </div>
        );

      case 'image':
        return (
          <div
            key={element.id}
            style={{
              position: 'absolute',
              left: `${element.position.x}px`,
              top: `${element.position.y}px`,
              width: `${element.style.width}px`,
              height: `${element.style.height}px`,
              borderRadius: `${element.style.borderRadius}px`,
              overflow: 'hidden'
            }}
          >
            <img 
              src={element.content} 
              alt="Template element" 
              className="w-full h-full object-cover"
            />
          </div>
        );

      case 'shape':
        return (
          <div
            key={element.id}
            style={{
              position: 'absolute',
              left: `${element.position.x}px`,
              top: `${element.position.y}px`,
              width: `${element.style.width}px`,
              height: `${element.style.height}px`,
              backgroundColor: element.style.backgroundColor,
              border: `${element.style.borderWidth}px solid ${element.style.borderColor}`,
              borderRadius: `${element.style.borderRadius}px`,
              borderStyle: 'solid'
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="relative"
      style={{
        width: `${template.canvas.width}px`,
        height: `${template.canvas.height}px`,
        backgroundColor: template.canvas.backgroundColor
      }}
    >
      {template.elements.map(renderElement)}
    </div>
  );
}
