"use client";
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { scatterPlotData } from "../data/dummy-data";

interface ScatterDataPoint {
  temperature: number;
  humidity: number;
  month: string;
  year: number;
}

const ScatterPlot = () => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("All");
  
  // Use state to track container dimensions
  const [dimensions, setDimensions] = useState({ width: 0, height: 350 });

  // Add resize observer to update chart size
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    const currentRef = chartContainerRef.current;
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: 350
        });
      }
    });
    
    resizeObserver.observe(currentRef);
    
    return () => {
      resizeObserver.unobserve(currentRef);
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    // Filter data based on selections
    let filteredData = [...scatterPlotData];
    
    if (selectedYear !== "All") {
      filteredData = filteredData.filter(d => d.year === parseInt(selectedYear));
    }

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Setup dimensions
    const margin = { top: 40, right: 20, bottom: 70, left: 50 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Create SVG group
    const svg = d3.select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // scales with safe fallbacks for min/max
    const minTemp = d3.min(filteredData, d => d.temperature);
    const maxTemp = d3.max(filteredData, d => d.temperature);
    const minHumidity = d3.min(filteredData, d => d.humidity);
    const maxHumidity = d3.max(filteredData, d => d.humidity);
    
    const x = d3.scaleLinear()
      .domain([
        (minTemp !== undefined ? minTemp : 0) - 1,
        (maxTemp !== undefined ? maxTemp : 30) + 1
      ])
      .range([0, width])
      .nice();

    const y = d3.scaleLinear()
      .domain([
        (minHumidity !== undefined ? minHumidity : 0) - 5,
        (maxHumidity !== undefined ? maxHumidity : 100) + 5
      ])
      .range([height, 0])
      .nice();

    // color scale for months
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const colorScale = d3.scaleOrdinal<string>()
      .domain(monthOrder)
      .range(d3.schemeCategory10);

    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "10px");

    // Add X axis label
    svg.append("text")
      .attr("transform", `translate(${width/2}, ${height + margin.bottom - 20})`)
      .style("text-anchor", "middle")
      .style("font-size", "11px")
      .text("Temperature (°C)");

    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "10px");

    // Add Y axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .text("Humidity (%)");

    // Create a tooltip div
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ccc")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", 1000);

    // data points with hover effects
    svg.selectAll("circle")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.temperature))
      .attr("cy", d => y(d.humidity))
      .attr("r", 6)
      .attr("fill", d => colorScale(d.month))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.8)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("stroke", "#000")
          .attr("stroke-width", 2)
          .attr("r", 8)
          .attr("opacity", 1);

        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        
        tooltip.html(`<strong>${d.month} ${d.year}</strong><br/>Temp: ${d.temperature}°C<br/>Humidity: ${d.humidity}%`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5)
          .attr("r", 6)
          .attr("opacity", 0.8);

        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    // Add trend line if enough data points
    if (filteredData.length > 1) {
      // Calculate trend line using simple linear regression
      const xValues = filteredData.map(d => d.temperature);
      const yValues = filteredData.map(d => d.humidity);
      
      // Calculate means with safety checks
      const xMean = d3.mean(xValues) ?? 0;
      const yMean = d3.mean(yValues) ?? 0;
      
      let numerator = 0;
      let denominator = 0;
      
      for (let i = 0; i < xValues.length; i++) {
        numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
        denominator += Math.pow(xValues[i] - xMean, 2);
      }
      
      const slope = denominator !== 0 ? numerator / denominator : 0;
      const intercept = yMean - (slope * xMean);
      
      // Trend line
      const line = d3.line<{x: number, y: number}>()
        .x(d => x(d.x))
        .y(d => y(d.y));
      
      // domain extent for x-axis
      const xDomain = x.domain();
      
      // points for line
      const trendData = [
        { x: xDomain[0], y: slope * xDomain[0] + intercept },
        { x: xDomain[1], y: slope * xDomain[1] + intercept }
      ];
      
      // Draw trend line
      svg.append("path")
        .datum(trendData)
        .attr("fill", "none")
        .attr("stroke", "#999")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "5,5")
        .attr("d", line);
      
      // Add trend line label
      const trendLabel = slope >= 0 ? "Positive correlation" : "Negative correlation";
      svg.append("text")
        .attr("x", width - 140)
        .attr("y", 20)
        .attr("text-anchor", "start")
        .style("font-size", "10px")
        .style("font-style", "italic")
        .text(trendLabel);
    }

    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 100}, -150)`);
    
    // add year legend
    if (selectedYear === "All") {
      const yearLegend = svg.append("g")
        .attr("transform", `translate(10, -20)`);
      
      [2022, 2023].forEach((year, i) => {
        const legendYears = filteredData.filter(d => d.year === year);
        if (legendYears.length > 0) {
          const legendRow = yearLegend.append("g")
            .attr("transform", `translate(${i * 50}, 0)`);
            
          legendRow.append("text")
            .attr("x", 0)
            .attr("y", 10)
            .text(year.toString())
            .style("font-size", "10px")
            .style("font-weight", "bold");
        }
      });
    }

    // Add month legend
    const presentMonths = Array.from(new Set(filteredData.map(d => d.month)))
      .sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
    
    // Organize legend in a grid if there are many months
    const legendColumns = presentMonths.length > 6 ? 2 : 1;
    const legendRows = Math.ceil(presentMonths.length / legendColumns);
    
    presentMonths.forEach((month, i) => {
      const column = Math.floor(i / legendRows);
      const row = i % legendRows;
      
      const legendItem = legend.append("g")
        .attr("transform", `translate(${column * 60}, ${row * 18})`);
      
      legendItem.append("circle")
        .attr("r", 5)
        .attr("fill", colorScale(month));
      
      legendItem.append("text")
        .attr("x", 10)
        .attr("y", 4)
        .text(month)
        .style("font-size", "9px");
    });

    // Clean up tooltip when component unmounts
    return () => {
      d3.select("body").selectAll(".tooltip").remove();
    };

  }, [selectedYear, dimensions]);

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg w-full">
      {/* Header */}
      <h2 className="font-bold text-lg mb-3">Temperature vs Humidity Correlation</h2>

      {/* Filters Container */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Year Filter */}
        <div className="flex bg-gray-100 rounded-md overflow-hidden">
          <select 
            className="p-1 border-r border-gray-300 bg-blue-500 text-white font-medium appearance-none px-3 text-sm"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="All">All Years</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
          </select>
        </div>
      </div>

      {/* Chart Container */}
      <div 
        ref={chartContainerRef} 
        className="bg-white p-0 rounded-md shadow-sm overflow-hidden w-full"
      >
        <svg ref={svgRef} width="100%" height="350"></svg>
      </div>
    </div>
  );
};

export default ScatterPlot;