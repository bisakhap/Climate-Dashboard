"use client"
import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { groupedBarChartData } from "../data/dummy-data"

// Defining interfaces
interface RegionData {
  Mountain: number
  Hill: number
  Terai: number
}

interface YearData {
  [year: string]: RegionData
}

interface MonthData {
  [month: string]: YearData
}

interface DataItem {
  month: string
  Mountain: number
  Hill: number
  Terai: number
  [key: string]: string | number
}

const BarChart = () => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string>("All")
  const [selectedYear, setSelectedYear] = useState<string>("All")

  // Use state to track container dimensions
  const [dimensions, setDimensions] = useState({ width: 0, height: 350 }) // Reduced height from 400 to 350

  // Add resize observer to update chart size
  useEffect(() => {
    if (!chartContainerRef.current) return

    const currentRef = chartContainerRef.current // Store reference for cleanup
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Fixed: Changed 'let' to 'const'
        setDimensions({
          width: entry.contentRect.width,
          height: 350, // Consistent with the reduced height
        })
      }
    })

    resizeObserver.observe(currentRef)

    return () => {
      resizeObserver.unobserve(currentRef) // Fixed: Using stored reference
    }
  }, [])

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return

    // Filter data based on selections
    let filteredData: DataItem[] = [...groupedBarChartData]

    if (selectedYear !== "All") {
      filteredData = filteredData.filter((d) => d.month.includes(selectedYear))
    }

    // Get the regions
    let regionsToShow: string[] = ["Mountain", "Hill", "Terai"]
    if (selectedRegion !== "All") {
      regionsToShow = [selectedRegion]
    }

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove()

    // Setup dimensions
    const margin = { top: 40, right: 20, bottom: 70, left: 50 } // Reduced margins
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom

    // Create SVG group
    const svg = d3
      .select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Group data by month
    const months: string[] = filteredData.map((d) => {
      // Extract just the month part
      const monthPart = d.month.split(" ")[0]
      return monthPart
    })

    // unique months for x-axis
    const uniqueMonths: string[] = Array.from(new Set(months))

    // X scale
    const x0 = d3.scaleBand().domain(uniqueMonths).range([0, width]).padding(0.2)

    // inner X scale for the groups
    const x1 = d3
      .scaleBand()
      .domain(selectedYear === "All" ? ["2022", "2023"] : [selectedYear])
      .range([0, x0.bandwidth()])

    // colors for regions
    const regionColors: { [key: string]: (value: number) => string } = {
      Mountain: (value: number) => {
        const intensity = Math.min(1, value / 350)
        return d3.interpolateRgb("#D2B48C", "#8B4513")(intensity)
      },
      Hill: (value: number) => {
        const intensity = Math.min(1, value / 350)
        return d3.interpolateRgb("#ABEBC6", "#196F3D")(intensity)
      },
      Terai: (value: number) => {
        const intensity = Math.min(1, value / 350)
        return d3.interpolateRgb("#AED6F1", "#1A5276")(intensity)
      },
    }

    //max value for Y scale
    const maxValue =
      d3.max(filteredData, (d) =>
        Math.max(
          ...regionsToShow.map((region) => {
            const value = d[region]
            return typeof value === "number" ? value : 0
          }),
        ),
      ) || 350

    // Y scale
    const y = d3.scaleLinear().domain([0, maxValue]).range([height, 0]).nice()

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")
      .style("font-size", "10px") // Smaller font for x-axis labels

    // Add X axis label
    svg
      .append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "11px") // Smaller font for axis title
      .text("Month")

    // Add Y axis
    svg
      .append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "10px") // Smaller font for y-axis labels
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "11px") // Smaller font for axis title
      .text("Rainfall (mm)")

    // Group data by month for grouped bars
    const groupedByMonth: MonthData = {}
    filteredData.forEach((d) => {
      const monthPart = d.month.split(" ")[0]
      const yearPart = d.month.split(" ")[1]

      if (!groupedByMonth[monthPart]) {
        groupedByMonth[monthPart] = {}
      }

      if (!groupedByMonth[monthPart][yearPart]) {
        groupedByMonth[monthPart][yearPart] = {
          Mountain: 0,
          Hill: 0,
          Terai: 0,
        }
      }

      groupedByMonth[monthPart][yearPart] = {
        Mountain: typeof d.Mountain === "number" ? d.Mountain : 0,
        Hill: typeof d.Hill === "number" ? d.Hill : 0,
        Terai: typeof d.Terai === "number" ? d.Terai : 0,
      }
    })

    // Create the bars
    uniqueMonths.forEach((month) => {
      // Get data for this month
      const monthData = groupedByMonth[month]

      // Skip if no data
      if (!monthData) return

      // Create groups for each year
      const yearGroups = svg.append("g").attr("transform", `translate(${x0(month)},0)`)

      // Create bars for each year
      Object.keys(monthData).forEach((year) => {
        // Skip if not the selected year and a specific year is selected
        if (selectedYear !== "All" && year !== selectedYear) return

        // Get data for this year
        const yearData = monthData[year]

        // Create bars for each region
        regionsToShow.forEach((region, regionIndex) => {
          const value = yearData[region as keyof RegionData]

          // Skip if no value
          if (!value || value <= 0) return

          // Calculate x position based on year
          const xPos = x1(year)
          if (xPos === undefined) return

          // Create bar
          const barWidth = x1.bandwidth() / regionsToShow.length
          const regionOffset = regionsToShow.indexOf(region) * barWidth

          // Add animation delay based on index for staggered effect
          const delay = regionIndex * 50 // 50ms delay between each region

          // Create the bar with initial state (height 0 and opacity 0)
          const bar = yearGroups
            .append("rect")
            .attr("x", xPos + regionOffset)
            .attr("y", height) // Start from the bottom
            .attr("width", barWidth)
            .attr("height", 0) // Initial height is 0
            .attr("fill", regionColors[region](value))
            .attr("opacity", 0) // Start with opacity 0
            .on("mouseover", function () {
              // Show tooltip
              d3.select(this).attr("opacity", 0.8)

              // Add tooltip
              svg
                .append("text")
                .attr("id", "tooltip")
                .attr("x", (x0(month) || 0) + xPos + regionOffset + barWidth / 2)
                .attr("y", y(value) - 10)
                .attr("text-anchor", "middle")
                .attr("font-size", "10px")
                .text(`${value} mm`)
            })
            .on("mouseout", function () {
              // Hide tooltip
              d3.select(this).attr("opacity", 1)
              svg.select("#tooltip").remove()
            })

          // Animate the bar growth and fade in
          bar
            .transition()
            .delay(delay)
            .duration(800) // Animation duration in milliseconds
            .attr("y", y(value)) // Final y position
            .attr("height", height - y(value)) // Final height
            .attr("opacity", 1) // Final opacity
            .ease(d3.easeCubicOut) // Smooth easing function
        })
      })
    })

    //legend for regions
    const legend = svg.append("g").attr("transform", `translate(${width - 70}, -30)`)

    // background for legend
    legend
      .append("rect")
      .attr("x", -10)
      .attr("y", -5)
      .attr("width", 80)
      .attr("height", regionsToShow.length * 18 + 10)
      .attr("fill", "white")
      .attr("stroke", "#e0e0e0")
      .attr("rx", 5)

    // legend items with fade-in animation
    regionsToShow.forEach((region, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 18})`)
        .attr("opacity", 0) // Start with opacity 0

      legendRow.append("rect").attr("width", 8).attr("height", 8).attr("fill", regionColors[region](200))

      legendRow.append("text").attr("x", 20).attr("y", 10).text(region).style("font-size", "10px")

      // Animate legend items
      legendRow
        .transition()
        .delay(i * 100) // Staggered delay
        .duration(500)
        .attr("opacity", 1)
    })

    //legend for years
    if (selectedYear === "All") {
      const yearLegend = svg.append("g").attr("transform", `translate(10, -20)`)
      ;["2022", "2023"].forEach((year, i) => {
        const legendRow = yearLegend
          .append("g")
          .attr("transform", `translate(${i * 50}, 0)`)
          .attr("opacity", 0) // Start with opacity 0

        legendRow
          .append("text")
          .attr("x", 0)
          .attr("y", 10)
          .text(year)
          .style("font-size", "10px")
          .style("font-weight", "bold")

        // Animate year legend items
        legendRow
          .transition()
          .delay(i * 100)
          .duration(500)
          .attr("opacity", 1)
      })
    }
  }, [selectedRegion, selectedYear, dimensions])

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg w-full">
      {/* Header */}
      <h2 className="font-bold text-lg mb-3">Rainfall by Region and Year</h2>

      {/* Filters Container  */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Region Filter */}
        <div className="flex bg-gray-100 rounded-md overflow-hidden">
          <select
            className="p-1 border-r border-gray-300 bg-blue-500 text-white font-medium appearance-none px-3 text-sm"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="All">All Regions</option>
            <option value="Mountain">Mountain</option>
            <option value="Hill">Hill</option>
            <option value="Terai">Terai</option>
          </select>
        </div>

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
      <div ref={chartContainerRef} className="bg-white p-0 rounded-md shadow-sm overflow-hidden w-full">
        <svg ref={svgRef} width="100%" height="350"></svg>
      </div>
    </div>
  )
}

export default BarChart

