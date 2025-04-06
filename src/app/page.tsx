import BarChart from "@/components/bar-chart";
import LineChart from "@/components/line-chart";
import ScatterPlot from "@/components/scatter-plot";
import PieChart from "@/components/pie-chart";
import TemperatureToday from "@/components/temperature-today";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Bar Chart and Scatter Plot */}
        <div className="flex flex-col gap-6">
          {/* Bar Chart */}
          <div className="h-[450px]">
            <BarChart />
          </div>
          
          {/* Scatter Plot */}
          <div className="h-[450px]">
            <ScatterPlot />
          </div>
        </div>

        {/* Right Column: Temperature Today and Line Chart */}
        <div className="flex flex-col gap-6">
          {/* Temperature Today */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <TemperatureToday />
          </div>
          
          {/* Line Chart */}
          <div className="h-[450px]">
            <LineChart />
          </div>
          <div className="h-[350px]">
            <PieChart />
          </div>
        </div>
      </div>
    </div>
  );
}