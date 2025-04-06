"use client";

import React from 'react';

interface DocumentationProps {
  title: string;
  description: string;
}

const Documentation: React.FC<DocumentationProps> = ({ title, description }) => {
  return (
    <div 
      className="bg-white border border-gray-200 p-4 rounded flex flex-col cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <div className="flex justify-between items-start mb-2">
        <h2 className="font-bold text-sm uppercase">{title}</h2>
      </div>
      <p className="text-sm text-gray-600 whitespace-pre-line">{description}</p>
    </div>
  );
};

const DocumentationCards = () => {
  const cards = [
    {
      title: "React Hooks",
      description: "1. useEffect: Set up and render the chart on mount, and clean up on unmount.\n2. useRef: Reference the <svg> element for direct D3.js manipulation.",
    },
    {
      title: "D3 Library",
      description: "1. d3.select(): Used to target and update SVG elements for dynamic changes in the chart.\n2. d3.scaleband: Used for setting the x-axis.\n3. d3.scaleLinear: Used for setting the y-axis.\n4. d3.line: Used to generate path for the lines",
    },
    {
      title: "CSS and Styling",
      description: "Tailwind CSS: Used for styling the chart container and other elements.",
    },
    {
      title: "Tooltip",
      description: "Used to show a tooltip on hover and displaying data.",
    },
    {
      title: "SVG Elements",
      description: "1. <svg>: Used to hold the chart.\n2. <rect>: Used to draw the bars.\n3. <path>: Used to draw the lines.",
    },
    {
      title: "ResizeObserver API",
      description: "resize(): Used to track container size changes and update chart dimensions.",
    },
    {
      title: "Event Handling",
      description: "1. onChange: Used to handle changes in the dropdowns.\n2. onClick: Used to handle clicks on the chart.",
    },
    {
      title: "Dynamic Chart Updates",
      description: "1. Used to filter data based on user input.\n2. Used to re-render the chart when filtered data or container size changes.",
    },
    {
        title: "Data Transitions",
        description: "Handled with D3’s transition function, ensuring smooth updates when the user changes filters.",
      },
      {
        title: "SVG Animation",
        description: "Used to animate bar growth, line dots, hover circles, legend visibility, and tooltips.",
      },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#006CD7] p-2 rounded mb-4 mt-4 ml-4 mr-4">
        <span className="text-white text-[12px] font-bold">PROJECT STACK AND DEPENDENCIES</span>
      </div>
      <div className="px-4 pb-8">
        <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {cards.map((card) => (
            <Documentation
              key={card.title}
              title={card.title}
              description={card.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentationCards;
