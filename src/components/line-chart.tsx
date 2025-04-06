"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { lineChartData } from "../data/dummy-data"

// Define TypeScript interfaces for the data
interface DataPoint {
  month: string
  temperature: number
}

const LineChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>("All Months")
  const [selectedYear, setSelectedYear] = useState<string>("All Years")
  const [filteredData, setFilteredData] = useState<DataPoint[]>(lineChartData)
  const [dimensions, setDimensions] = useState({ width: 0, height: 350 })
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const years = ["2022", "2023"]

  // Add resize observer to update chart size
  useEffect(() => {
    if (!containerRef.current) return

    const currentRef = containerRef.current
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: 350,
        })
      }
    })

    resizeObserver.observe(currentRef)

    return () => {
      resizeObserver.unobserve(currentRef)
    }
  }, [])

  // Filter data based on selected month and year
  useEffect(() => {
    let newData = [...lineChartData]

    if (selectedMonth !== "All Months") {
      const monthIndex = months.indexOf(selectedMonth)
      newData = newData.filter((d) => {
        const dateParts = d.month.split(" ")
        const dataMonth = dateParts[0]
        return dataMonth === months[monthIndex].substring(0, 3)
      })
    }

    if (selectedYear !== "All Years") {
      newData = newData.filter((d) => d.month.includes(selectedYear))
    }

    setFilteredData(newData)
  }, [selectedMonth, selectedYear])

  // Draw chart whenever data changes or dimensions update
  useEffect(() => {
    if (!svgRef.current || filteredData.length === 0 || !containerRef.current || dimensions.width === 0) return

    const svg = d3.select(svgRef.current)

    // Clear previous chart
    svg.selectAll("*").remove()

    // Setup dimensions
    const margin = { top: 40, right: 20, bottom: 70, left: 50 }
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom

    // Set SVG dimensions
    svg.attr("width", dimensions.width).attr("height", dimensions.height)

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`)

    // Process data to get all available months for x-axis
    const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Group data by year
    const dataByYear: Record<string, DataPoint[]> = {}
    filteredData.forEach((d) => {
      const year = d.month.split(" ")[1]
      if (!dataByYear[year]) {
        dataByYear[year] = []
      }
      dataByYear[year].push(d)
    })

    // scales
    const xScale = d3.scaleBand().domain(allMonths).range([0, width]).padding(0.2)

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => d.temperature) ?? 0 * 1.1])
      .range([height, 0])
      .nice()

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")
      .style("font-size", "10px")

    // X axis label
    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "11px")
      .text("Month")

    // Add Y axis
    g.append("g").call(d3.axisLeft(yScale)).selectAll("text").style("font-size", "10px")

    // Y axis label
    g.append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .text("Temperature (°C)")

    // grid lines
    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => ""),
      )
      .attr("stroke-opacity", 0.1)

    // Color scale for years
    const colorScale = d3.scaleOrdinal<string>().domain(Object.keys(dataByYear)).range(["#3b82f6", "#f97316"])

    // lines for each year
    Object.entries(dataByYear).forEach(([year, yearData]) => {
      // Sort data by month to ensure correct line path
      yearData.sort((a, b) => {
        const monthA = months.findIndex((m) => m.substring(0, 3) === a.month.split(" ")[0])
        const monthB = months.findIndex((m) => m.substring(0, 3) === b.month.split(" ")[0])
        return monthA - monthB
      })

      // line generator
      const line = d3
        .line<DataPoint>()
        .x((d) => (xScale(d.month.split(" ")[0]) ?? 0) + xScale.bandwidth() / 2)
        .y((d) => yScale(d.temperature))
        .curve(d3.curveMonotoneX)

      // line with animation
      const path = g
        .append("path")
        .datum(yearData)
        .attr("fill", "none")
        .attr("stroke", colorScale(year))
        .attr("stroke-width", 2)
        .attr("d", line)
        .attr("stroke-dasharray", function () {
          return this.getTotalLength()
        })
        .attr("stroke-dashoffset", function () {
          return this.getTotalLength()
        })

      // Animate the line drawing
      path.transition().duration(1500).ease(d3.easeLinear).attr("stroke-dashoffset", 0)

      // data points with animation
      const dots = g
        .selectAll(`.dot-${year}`)
        .data(yearData)
        .enter()
        .append("circle")
        .attr("class", `dot-${year}`)
        .attr("cx", (d) => (xScale(d.month.split(" ")[0]) ?? 0) + xScale.bandwidth() / 2)
        .attr("cy", (d) => yScale(d.temperature))
        .attr("r", 0) // Start with radius 0
        .attr("fill", colorScale(year))

      // Animate the dots appearing
      dots
        .transition()
        .duration(1500)
        .delay((d, i) => i * 150) // Stagger the animations
        .attr("r", 3) // Grow to final size
        .ease(d3.easeElastic)

      // tooltips
      g.selectAll(`.hover-${year}`)
        .data(yearData)
        .enter()
        .append("circle")
        .attr("class", `hover-${year}`)
        .attr("cx", (d) => (xScale(d.month.split(" ")[0]) ?? 0) + xScale.bandwidth() / 2)
        .attr("cy", (d) => yScale(d.temperature))
        .attr("r", 0) // Start with radius 0
        .attr("fill", "transparent")
        .transition()
        .duration(1500)
        .delay((d, i) => i * 150) // Match the dots animation
        .attr("r", 8) // Grow to final size
        .on("end", function () {
          // Add event listeners after animation completes
          d3.select(this)
            .on("mouseover", function (event, d) {
              // Type cast d to DataPoint
              const dataPoint = d as unknown as DataPoint

              // Simple tooltip
              g.append("text")
                .attr("class", "tooltip")
                .attr("x", (xScale(dataPoint.month.split(" ")[0]) ?? 0) + xScale.bandwidth() / 2)
                .attr("y", yScale(dataPoint.temperature) - 10)
                .attr("text-anchor", "middle")
                .attr("font-size", "10px")
                .text(`${dataPoint.temperature}°C`)

              d3.select(this).attr("r", 5).attr("fill", "none").attr("stroke", colorScale(year)).attr("stroke-width", 2)
            })
            .on("mouseout", function () {
              g.selectAll(".tooltip").remove()
              // Reset the point size
              d3.select(this).attr("r", 8).attr("fill", "transparent").attr("stroke", null)
            })
        })
    })

    // Add compact legend in top-right corner (matching bar chart style)
    const legend = g.append("g").attr("transform", `translate(${width - 70}, -30)`)

    // Add background for legend
    legend
      .append("rect")
      .attr("x", -10)
      .attr("y", -5)
      .attr("width", 80)
      .attr("height", Object.keys(dataByYear).length * 18 + 10)
      .attr("fill", "white")
      .attr("stroke", "#e0e0e0")
      .attr("rx", 5)

    // Add legend items
    Object.keys(dataByYear).forEach((year, i) => {
      const legendRow = legend.append("g").attr("transform", `translate(0, ${i * 18})`)

      legendRow.append("rect").attr("width", 12).attr("height", 12).attr("fill", colorScale(year))

      legendRow.append("text").attr("x", 20).attr("y", 10).text(year).style("font-size", "10px")
    })
  }, [filteredData, dimensions])

  // Reset filters
  const resetFilters = () => {
    setSelectedMonth("All Months")
    setSelectedYear("All Years")
  }

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg w-full">
      {/* Header */}
      <h2 className="font-bold text-lg mb-3">Temperature by Month</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Month Filter */}
        <div className="flex bg-gray-100 rounded-md overflow-hidden">
          <select
            className="p-1 border-r border-gray-300 bg-blue-500 text-white font-medium appearance-none px-3 text-sm"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option>All Months</option>
            {months.map((month) => (
              <option key={month}>{month}</option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div className="flex bg-gray-100 rounded-md overflow-hidden">
          <select
            className="p-1 border-r border-gray-300 bg-blue-500 text-white font-medium appearance-none px-3 text-sm"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option>All Years</option>
            {years.map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <button
          className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 font-medium text-sm rounded-md"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>

      {/* Chart Container - matching bar chart */}
      <div ref={containerRef} className="bg-white p-0 rounded-md shadow-sm overflow-hidden w-full">
        <svg ref={svgRef} width="100%" height="350"></svg>
      </div>
    </div>
  )
}

export default LineChart

