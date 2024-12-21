import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import * as XLSX from "xlsx";
import _ from "lodash";

const PositionDashboard = () => {
  const [data, setData] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState("양방향");
  const [selectedConditions, setSelectedConditions] = useState({
    signal_t: "n",
    numsig_ratio: "Under20p",
    num_PvsN: "moreN",
    "t-1vst": "same",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/data/combined_position_4cond.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, {
          type: "array",
          cellStyles: true,
          cellDates: true,
          cellNF: true,
          sheetStubs: true,
        });
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        setData(jsonData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  const positions = ["양방향", "롱", "숏"];
  const conditions = {
    signal_t: ["n", "p"],
    numsig_ratio: ["Under20p", "Over20p"],
    num_PvsN: ["moreN", "moreP"],
    "t-1vst": ["same", "diff"],
  };

  const getFilteredData = () => {
    return data.filter(
      (row) =>
        row.position_type === selectedPosition &&
        row.signal_t === selectedConditions.signal_t &&
        row.numsig_ratio === selectedConditions.numsig_ratio &&
        row.num_PvsN === selectedConditions.num_PvsN &&
        row["t-1vst"] === selectedConditions["t-1vst"]
    );
  };

  const filteredData = getFilteredData();
  const formattedData = filteredData.map((row) => ({
    name: row.metric,
    value: row.value,
  }));

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Position Analysis Dashboard</h2>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-6">
          <div className="space-y-2">
            <p className="font-medium">Position Type</p>
            <div className="flex space-x-2">
              {positions.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setSelectedPosition(pos)}
                  className={`px-3 py-1 rounded ${
                    selectedPosition === pos
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {Object.entries(conditions).map(([key, values]) => (
            <div key={key} className="space-y-2">
              <p className="font-medium">{key}</p>
              <div className="flex space-x-2">
                {values.map((value) => (
                  <button
                    key={value}
                    onClick={() =>
                      setSelectedConditions((prev) => ({ ...prev, [key]: value }))
                    }
                    className={`px-3 py-1 rounded ${
                      selectedConditions[key] === value
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="text-lg font-semibold mb-4">Metrics Distribution</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="text-lg font-semibold mb-4">Metrics Radar</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={formattedData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis />
                <Radar
                  name="Value"
                  dataKey="value"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Data Table */}
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="text-lg font-semibold mb-4">Detailed Metrics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formattedData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.value.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PositionDashboard;