import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";
import type { SensorData } from "../helpers";


type Props = {
  data: Array<SensorData>;
};

export default function DHT11Chart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: 0, bottom: 50 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="temperature" stroke="#ff7300" />
        <Line type="monotone" dataKey="humidity" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
