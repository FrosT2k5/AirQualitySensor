import {
  Container,
  Heading,
  Grid,
  GridItem,
  Box,
  Text,
} from "@chakra-ui/react";
import { useConnection } from "./ui/ConnectionContext";
import { onlineState } from "~/helpers";
import { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import { addDays, startOfDay, endOfDay } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { useColorModeValue } from "./ui/color-mode";

import MQ135Chart from './MQ135Chart';
import MQ2Chart from './MQ2Chart';
import DHT11Chart from './DHTChart';
import QualityScoreChart, { airQualityScore } from './QualityScoreChart';
import QualityBarChart from "./QualityBarChart";
import './styles/datepicker.css';
export function HistoryDashboardFallback() {
  return <Text>Fallback here</Text>;
}

type LoaderData = Record<string, {
  dht: { temperature: number; humidity: number };
  mq135: Record<string, number>;
  mq2: Record<string, number>;
}>;

type Props = {
  loaderData: LoaderData;
};

export default function HistoryDashboard({ loaderData }: Props) {
  const { setConnectionState } = useConnection();
  const datePickerClass = useColorModeValue("datepicker-light", "datepicker-dark");

  // Update connection state, shown in navbar
  setConnectionState(onlineState.online);

  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);

  const onChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end); // fallback to start until user selects end
  };

  // Filter loaderData for the selected date range and downsample
  const filteredData = useMemo(() => {
    if (!startDate) return [];

    const effectiveEnd = endDate ?? startDate;
    const startTs = startOfDay(startDate).getTime() / 1000;
    const endTs = endOfDay(effectiveEnd).getTime() / 1000;

    const entries = Object.entries(loaderData)
      .map(([ts, value]) => [Number(ts), value] as [number, typeof value])
      .filter(([ts]) => ts >= startTs && ts <= endTs)
      .sort(([a], [b]) => a - b);

    const maxPoints = 15;
    if (entries.length <= maxPoints) return entries;

    const interval = Math.floor(entries.length / maxPoints);
    const sampled: typeof entries = [];
    for (let i = 0; i < entries.length; i += interval) {
      sampled.push(entries[i]);
    }
    return sampled;
  }, [loaderData, startDate, endDate]);

  // Chart data
  const mq135Data = filteredData.map(([ts, value]) => ({ name: new Date(Number(ts) * 1000).toLocaleString(), ...value.mq135 }));
  const mq2Data = filteredData.map(([ts, value]) => ({ name: new Date(Number(ts) * 1000).toLocaleString(), ...value.mq2 }));
  const dhtData = filteredData.map(([ts, value]) => ({ name: new Date(Number(ts) * 1000).toLocaleString(), ...value.dht }));

  const airQualityScores = useMemo(() => {
    if (filteredData.length === 0) return [];

    return filteredData.map(([ts, value]) => ({
      name: new Date(Number(ts) * 1000).toLocaleString(),
      score: 100 - airQualityScore({ MQ135: value.mq135, MQ2: value.mq2 }, "average"),
    }));
  }, [filteredData]);

  let avgAirQualityScore = 0;
  airQualityScores.forEach((value) => {
    avgAirQualityScore += value.score;
  })
  avgAirQualityScore /= airQualityScores.length;

  return (
    <Container mt="4">
      <Heading textStyle="3xl" fontWeight="bold" mb="5">
        History Dashboard
      </Heading>

      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap="6">
        {/* Date Range Picker */}
        <GridItem>
          <Box
            h="440px"
            p="0"
            border="solid 1px"
            borderRadius="15px"
            borderColor="InactiveBorder"
            shadow="lg"
          >
            <Text textAlign="center" mt="2" mb="12" fontWeight="bold">
              Select Date Range
            </Text>
            <Box
              p="4"
              mx="14"
              display="flex"
              justifyContent="center"
              textAlign="center"
              className={datePickerClass}
            >
              <DatePicker
                selected={startDate}
                onChange={onChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                inline
              />
            </Box>
          </Box>
        </GridItem>

        {/* MQ135 Chart */}
        <GridItem>
          <Box h="440px" p="0" border="solid 1px" borderRadius="15px" borderColor="InactiveBorder" shadow="lg">
            <Text textAlign="center" mt="2" mb="2" fontWeight="bold">MQ135 Readings (PPM):</Text>
            <MQ135Chart data={mq135Data} />
          </Box>
        </GridItem>

        {/* MQ2 Chart */}
        <GridItem>
          <Box h="440px" p="0" border="solid 1px" borderRadius="15px" borderColor="InactiveBorder" shadow="lg">
            <Text textAlign="center" mt="2" mb="2" fontWeight="bold">MQ2 Readings (PPM):</Text>
            <MQ2Chart data={mq2Data} />
          </Box>
        </GridItem>

        {/* DHT11 Chart */}
        <GridItem>
          <Box h="440px" p="0" border="solid 1px" borderRadius="15px" borderColor="InactiveBorder" shadow="lg">
            <Text textAlign="center" mt="2" mb="2" fontWeight="bold">DHT11 Readings (°C / %):</Text>
            <DHT11Chart data={dhtData} />
          </Box>
        </GridItem>

        {/* Air Quality Score */}
        <GridItem>
          <Box h="440px" p="0" border="solid 1px" borderRadius="15px" borderColor="InactiveBorder" shadow="lg">
            <Text textAlign="center" mt="2" mb="2" fontWeight="bold">Average Air Quality Score (%):</Text>
            <QualityScoreChart score={100 - avgAirQualityScore} />
            <Box textAlign={"center"} mt='20'>
              <Text fontSize="xl"> Average Air Quality Score: {(avgAirQualityScore)} %</Text>
            </Box>
          </Box>
        </GridItem>

        {/* Air Quality Bar Chart */}
        <GridItem>
          <Box h="440px" p="0" border="solid 1px" borderRadius="15px" borderColor="InactiveBorder" shadow="lg">
            <Text textAlign="center" mt="2" mb="2" fontWeight="bold">Air Quality Score (%):</Text>
            <QualityBarChart data={airQualityScores} />
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
}
