import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { FullSensorResponse, MQ135Data, MQ2Data } from "~/helpers";

// ------------------------
// Air Quality Scoring
// ------------------------

type GasName = "CO2" | "Aceton" | "Alcohol";

type Threshold = {
  good: number;
  moderate: number;
  bad: number;
};

type Thresholds = Record<GasName, Threshold>;

// define thresholds for only the gases we care about
const thresholds: Thresholds = {
  CO2: { good: 100, moderate: 200, bad: 500 },
  Aceton: { good: 200, moderate: 500, bad: 1000 },
  Alcohol: { good: 100, moderate: 300, bad: 1000 },
};

// score a single gas into the 0-100 gauge:
// Good: 0-30, Moderate: 30-60, Bad: 60-100
function scoreGas(gas: GasName, value: number): number {
  const { good, moderate, bad } = thresholds[gas];
  let score: number;

  if (value <= good) {
    // map linearly from 0 → 30
    score = (value / good) * 30;
  } else if (value <= moderate) {
    // map linearly from 30 → 60
    score = 30 + ((value - good) / (moderate - good)) * 30;
  } else if (value <= bad) {
    // map linearly from 60 → 100
    score = 60 + ((value - moderate) / (bad - moderate)) * 40;
  } else {
    // anything above 'bad' → cap at 100
    score = 100;
  }

  return Math.min(Math.max(0, score), 100);
}

// compute overall air quality score from FullSensorResponse
export function airQualityScore(
  readings: FullSensorResponse,
  mode: "average" | "worst" = "average"
): number {
  const scores: number[] = [];
  (Object.keys(thresholds) as GasName[]).forEach((gas) => {
    let val: number | undefined;

    // pick value from MQ135 first
    if (gas in readings.MQ135) val = readings.MQ135[gas as keyof MQ135Data];
    // fallback to MQ2 if Alcohol is missing in MQ135
    else if (gas in readings.MQ2) val = readings.MQ2[gas as keyof MQ2Data];

    if (typeof val === "number") {
      scores.push(scoreGas(gas, val));
    }
  });

  if (scores.length === 0) return 100;

  let finalScore: number;
  if (mode === "average") {
    finalScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  } else {
    finalScore = Math.min(...scores); // worst-case pollutant
  }

  return Math.round(Math.max(1, Math.min(100, finalScore)));
}

// Chart Component related stuff
const chartData = [
  { name: "Good", value: 30 }, // green
  { name: "Moderate", value: 30 }, // yellow
  { name: "Bad", value: 40 }, // red
];

const ACTIVE_COLORS = ["#00C853", "#FFD600", "#D50000"]; // green, yellow, red
const INACTIVE_COLOR = "#E0E0E0"; // grey for inactive segments

type Props = {
  score: number;
};

export default function QualityScoreChart({ score }: Props) {
  // determine which segment is active

  const colors = useMemo(() => chartData.map((segment, index) => {
    if (score <= 30 && index === 0) return ACTIVE_COLORS[0]; // green active
    if (score > 30 && score <= 60 && index === 1) return ACTIVE_COLORS[1]; // yellow active
    if (score > 60 && index === 2) return ACTIVE_COLORS[2]; // red active
    return INACTIVE_COLOR; // others grey
  }), [score]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy={200}
          startAngle={180}
          endAngle={0}
          innerRadius={100}
          outerRadius={150}
          dataKey="value"
          paddingAngle={5}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${entry.name}`} fill={colors[index]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
