"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import { stackedChartData } from "../data/dummy-data"

const PollutionChart = () => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    // Clear any existing chart
    d3.select(svgRef.current).selectAll("*").remove()

    // Set up dimensions
    const svg = d3.select(svgRef.current)
    const width = svgRef.current.clientWidth
    const height = 235
    const margin = { top: 30, right: 80, bottom: 40, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Create the main group element
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // Set up scales
    const xScale = d3
      .scaleBand()
      .domain(stackedChartData.map((d) => d.name))
      .range([0, innerWidth])
      .padding(0.3)

    // Find max value for y-scale (stacked bars)
    const yMax = d3.max(stackedChartData, (d) => d.fineParticles + d.coarseParticles) || 0

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax * 1.1]) // Add 10% padding
      .range([innerHeight, 0])

    // Set up humidity scale (for line chart)
    const humidityScale = d3
      .scaleLinear()
      .domain([0, d3.max(stackedChartData, (d) => d.humidity) || 0])
      .range([innerHeight, 0])

    // Color scales 
    const fineParticlesColorScale = d3
      .scaleLinear<string>()
      .domain([
        d3.min(stackedChartData, (d) => d.fineParticles) || 0,
        d3.max(stackedChartData, (d) => d.fineParticles) || 0,
      ])
      .range(["#6baed6", "#08519c"])

    const coarseParticlesColorScale = d3
      .scaleLinear<string>()
      .domain([
        d3.min(stackedChartData, (d) => d.coarseParticles) || 0,
        d3.max(stackedChartData, (d) => d.coarseParticles) || 0,
      ])
      .range(["#fd8d3c", "#bd0026"])

    // Create tooltip div
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "10")

    // Draw x-axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("font-size", "10px")

    // Draw y-axis for particles
    g.append("g").call(d3.axisLeft(yScale).ticks(5)).selectAll("text").attr("font-size", "10px")

    // Draw y-axis for humidity
    g.append("g")
      .attr("transform", `translate(${innerWidth}, 0)`)
      .call(d3.axisRight(humidityScale).ticks(5))
      .selectAll("text")
      .attr("font-size", "10px")

    // Add y-axis label for particles
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .text("Particles (µg/m³)")

    // Add y-axis label for humidity
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", innerWidth + margin.right - 15)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .text("Humidity (%)")

    // Draw stacked bars
    stackedChartData.forEach((d) => {
      // Fine particles (bottom bar)
      g.append("rect")
        .attr("x", xScale(d.name) || 0)
        .attr("y", yScale(d.fineParticles))
        .attr("width", xScale.bandwidth())
        .attr("height", innerHeight - yScale(d.fineParticles))
        .attr("fill", fineParticlesColorScale(d.fineParticles))
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .on("mouseover", () => {
          tooltip
            .style("visibility", "visible")
            .html(`<strong>${d.name}</strong><br/>Fine Particles: ${d.fineParticles} µg/m³`)
        })
        .on("mousemove", (event) => {
          tooltip.style("top", event.pageY - 10 + "px").style("left", event.pageX + 10 + "px")
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden")
        })

      // Coarse particles
      g.append("rect")
        .attr("x", xScale(d.name) || 0)
        .attr("y", yScale(d.fineParticles + d.coarseParticles))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale(d.fineParticles) - yScale(d.fineParticles + d.coarseParticles))
        .attr("fill", coarseParticlesColorScale(d.coarseParticles))
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .on("mouseover", () => {
          tooltip
            .style("visibility", "visible")
            .html(`<strong>${d.name}</strong><br/>Coarse Particles: ${d.coarseParticles} µg/m³`)
        })
        .on("mousemove", (event) => {
          tooltip.style("top", event.pageY - 10 + "px").style("left", event.pageX + 10 + "px")
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden")
        })
    })

    // Draw line for humidity
    const line = d3
      .line<(typeof stackedChartData)[0]>()
      .x((d) => (xScale(d.name) || 0) + xScale.bandwidth() / 2)
      .y((d) => humidityScale(d.humidity))

    g.append("path")
      .datum(stackedChartData)
      .attr("fill", "none")
      .attr("stroke", "#9467bd")
      .attr("stroke-width", 2)
      .attr("d", line)

    // dots for humidity values
    g.selectAll(".humidity-dot")
      .data(stackedChartData)
      .enter()
      .append("circle")
      .attr("class", "humidity-dot")
      .attr("cx", (d) => (xScale(d.name) || 0) + xScale.bandwidth() / 2)
      .attr("cy", (d) => humidityScale(d.humidity))
      .attr("r", 4)
      .attr("fill", "#9467bd")
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible").html(`<strong>${d.name}</strong><br/>Humidity: ${d.humidity}%`)
      })
      .on("mousemove", (event) => {
        tooltip.style("top", event.pageY - 10 + "px").style("left", event.pageX + 10 + "px")
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden")
      })

    function resize() {
      if (!svgRef.current) return

      const newWidth = svgRef.current.clientWidth
      svg.attr("width", newWidth)

      // Update scales
      xScale.range([0, newWidth - margin.left - margin.right])

      svg.selectAll("*").remove()
      // Re-render the chart with new dimensions
    }

    // Add resize listener
    window.addEventListener("resize", resize)

    // Clean up tooltip when component unmounts
    return () => {
      window.removeEventListener("resize", resize)
      d3.select("body").selectAll(".tooltip").remove()
    }
  }, [])

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg w-full">
      {/* Header */}
      <h2 className="font-bold mb-4">Air Pollution in the Valley</h2>

      {/* Chart Container */}
      <div className="bg-white p-4 rounded-md shadow-md">
        <svg ref={svgRef} width="100%" height="235"></svg>
      </div>
    </div>
  )
}

export default PollutionChart

