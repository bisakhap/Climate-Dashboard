"use client";
import React from "react";

const TemperatureToday = () => {
  const data = {
    temperature: -14,
    location: "KATHMANDU",
    time: "10:16",
    date: "March 05, 2025",
    condition: "partly_cloudy_snow" 
  };

  // Function to render the weather icon based on condition
  const renderWeatherIcon = (condition: string) => {
    switch (condition) {
      case "partly_cloudy_snow":
        return (
          <div className="relative">
            {/* Cloud */}
            <div className="absolute left-0 top-0 w-10 h-6 bg-gray-200 rounded-full opacity-80"></div>
            {/* Sun */}
            <div className="absolute left-5 top-1 w-8 h-8 bg-yellow-300 rounded-full"></div>
            {/* Snow dots */}
            <div className="absolute left-1 top-8 w-1 h-1 bg-gray-200 rounded-full"></div>
            <div className="absolute left-3 top-9 w-1 h-1 bg-gray-200 rounded-full"></div>
            <div className="absolute left-5 top-8 w-1 h-1 bg-gray-200 rounded-full"></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between w-full">
      <div className="flex items-center">
        <div className="w-16 h-16 mr-6">
          {renderWeatherIcon(data.condition)}
        </div>
        <div className="text-3xl font-semibold text-blue-900">
          {data.temperature}°C
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium text-gray-800">{data.location}</div>
        <div className="text-sm text-gray-500">{data.time}</div>
        <div className="text-sm text-gray-500">{data.date}</div>
      </div>
    </div>
  );
};

export default TemperatureToday;