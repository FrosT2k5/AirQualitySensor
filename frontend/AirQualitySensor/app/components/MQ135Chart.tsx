import { useEffect, useState } from "react";
import { getEndpoints, config, type SensorData } from "./helpers";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";


type Props = {
  data: Array<SensorData>,
}

export default function MQ135Chart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" >
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: 0, bottom: 50 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="CO2" stroke="#ff7300" />
        <Line type="monotone" dataKey="CO" stroke="#8884d8" />
        <Line type="monotone" dataKey="Alcohol" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
}
