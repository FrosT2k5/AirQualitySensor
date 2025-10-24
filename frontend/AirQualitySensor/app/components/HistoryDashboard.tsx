import {
  Container,
  Heading,
  Grid,
  GridItem,
  Box,
  Text,
  Button,
  Flex,
  Select,
} from "@chakra-ui/react";
import { useConnection } from "./ui/ConnectionContext";
import React from 'react';
import { onlineState } from "~/helpers";
import { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import { addDays, startOfDay, endOfDay } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { useColorModeValue } from "./ui/color-mode";

import MQ135Chart from './MQ135Chart';
import MQ2Chart from './MQ2Chart';
import DHT11Chart from './DHTChart';
import type { SensorData, MQ135Data, MQ2Data } from "../helpers";
import QualityScoreChart, { airQualityScore } from './QualityScoreChart';
import QualityBarChart from "./QualityBarChart";
import './styles/datepicker.css';
export function HistoryDashboardFallback() {
  return <Text>Fallback here</Text>;
}

type LoaderData = Record<string, {
  dht: { temperature: number; humidity: number };
  mq135: MQ135Data;
  mq2: MQ2Data;
}>;

type Props = {
  loaderData: LoaderData;
};

export default function HistoryDashboard({ loaderData }: Props) {
  const { setConnectionState } = useConnection();
  const datePickerClass = useColorModeValue("datepicker-light", "datepicker-dark");

  setConnectionState(onlineState.online);

  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('csv');

  function notify(type: 'success' | 'warning' | 'error', title: string, description?: string) {
    if (type === 'success') {
      console.log(title, description || '');
    } else {
      window.alert(`${title}${description ? ' - ' + description : ''}`);
    }
  }

  const selectBg = useColorModeValue('#FFFFFF', '#1A202C');
  const selectColor = useColorModeValue('#000000', '#FFFFFF');
  const selectBorder = useColorModeValue('#E2E8F0', '#2D3748');

  const onChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

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

  const mq135Data = filteredData.map(([ts, value]) => ({ name: new Date(Number(ts) * 1000).toLocaleString(), ...value.mq135 })) as unknown as SensorData[];
  const mq2Data = filteredData.map(([ts, value]) => ({ name: new Date(Number(ts) * 1000).toLocaleString(), ...value.mq2 })) as unknown as SensorData[];
  const dhtData = filteredData.map(([ts, value]) => ({ name: new Date(Number(ts) * 1000).toLocaleString(), ...value.dht })) as unknown as SensorData[];

  const hasFilteredData = filteredData.length > 0;

  const airQualityScores = useMemo(() => {
    if (filteredData.length === 0) return [];

    return filteredData.map(([ts, value]) => ({
      name: new Date(Number(ts) * 1000).toLocaleString(),
      score: 100 - airQualityScore({ MQ135: value.mq135 as any, MQ2: value.mq2 as any, DHT11: value.dht as any, score: 0 }, "average"),
    }));
  }, [filteredData]);

  let avgAirQualityScore = 0;
  if (airQualityScores.length > 0) {
    avgAirQualityScore = airQualityScores.reduce((acc, v) => acc + v.score, 0) / airQualityScores.length;
  }

  async function exportData() {
    if (filteredData.length === 0) {
      notify('warning', 'No data to export');
      return;
    }

    const dhtKeys = new Set<string>();
    const mq135Keys = new Set<string>();
    const mq2Keys = new Set<string>();

    filteredData.forEach(([_, value]) => {
      if (value.dht) Object.keys(value.dht).forEach((k) => dhtKeys.add(k));
      if (value.mq135) Object.keys(value.mq135).forEach((k) => mq135Keys.add(k));
      if (value.mq2) Object.keys(value.mq2).forEach((k) => mq2Keys.add(k));
    });

    const headers: string[] = ["timestamp"];
    const dhtCols = Array.from(dhtKeys).map((k) => `dht_${k}`);
    const mq135Cols = Array.from(mq135Keys).map((k) => `mq135_${k}`);
    const mq2Cols = Array.from(mq2Keys).map((k) => `mq2_${k}`);

    headers.push(...dhtCols, ...mq135Cols, ...mq2Cols);

    const startStr = startDate ? startOfDay(startDate).toISOString().slice(0,10) : new Date().toISOString().slice(0,10);
    const endStr = endDate ? endOfDay(endDate).toISOString().slice(0,10) : startStr;
    const filenameBase = `airquality_${startStr}_to_${endStr}`;

    try {
      if (exportFormat === 'csv') {
        const rows: string[] = [];
        rows.push(headers.join(","));

        filteredData.forEach(([ts, value]) => {
          const cols: string[] = [];
          cols.push(new Date(Number(ts) * 1000).toISOString());

          dhtCols.forEach((col) => {
            const key = col.replace(/^dht_/, "");
            const v = value.dht && (value.dht as any)[key] !== undefined ? String((value.dht as any)[key]) : "";
            cols.push(escapeCsv(v));
          });

          mq135Cols.forEach((col) => {
            const key = col.replace(/^mq135_/, "");
            const v = value.mq135 && (value.mq135 as any)[key] !== undefined ? String((value.mq135 as any)[key]) : "";
            cols.push(escapeCsv(v));
          });

          mq2Cols.forEach((col) => {
            const key = col.replace(/^mq2_/, "");
            const v = value.mq2 && (value.mq2 as any)[key] !== undefined ? String((value.mq2 as any)[key]) : "";
            cols.push(escapeCsv(v));
          });

          rows.push(cols.join(","));
        });

        const csv = rows.join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filenameBase}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
  notify('success', 'CSV downloaded', `${filenameBase}.csv`);
      } else {
        try {
          const XLSX = await import('xlsx');
          const aoa: any[] = [];
          aoa.push(headers);

          filteredData.forEach(([ts, value]) => {
            const row: any[] = [];
            row.push(new Date(Number(ts) * 1000).toISOString());

            dhtCols.forEach((col) => {
              const key = col.replace(/^dht_/, "");
              row.push(value.dht && (value.dht as any)[key] !== undefined ? (value.dht as any)[key] : "");
            });

            mq135Cols.forEach((col) => {
              const key = col.replace(/^mq135_/, "");
              row.push(value.mq135 && (value.mq135 as any)[key] !== undefined ? (value.mq135 as any)[key] : "");
            });

            mq2Cols.forEach((col) => {
              const key = col.replace(/^mq2_/, "");
              row.push(value.mq2 && (value.mq2 as any)[key] !== undefined ? (value.mq2 as any)[key] : "");
            });

            aoa.push(row);
          });

          const ws = XLSX.utils.aoa_to_sheet(aoa);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Data');
          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          const blob = new Blob([wbout], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filenameBase}.xlsx`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          notify('success', 'XLSX downloaded', `${filenameBase}.xlsx`);
        } catch (err: any) {
          console.error('Failed to load xlsx module', err);
          notify('warning', 'XLSX export unavailable', 'Install the `xlsx` package (npm install xlsx) to enable XLSX export.');
        }
      }
    } catch (err) {
      console.error('Export error', err);
      notify('error', 'Export failed');
    }
  }

  function escapeCsv(value: string) {
    if (value == null) return "";
    if (/[",\n]/.test(value)) {
      return `"${String(value).replace(/"/g, '""')}"`;
    }
    return value;
  }

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
            <Flex alignItems="center" justifyContent="space-between" px="4">
              <Text textAlign="center" mt="2" mb="12" fontWeight="bold">
                Select Date Range
              </Text>
              <Flex alignItems="center">
                <select
                  value={exportFormat}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setExportFormat(e.target.value as 'csv' | 'xlsx')}
                  style={{
                    width: 130,
                    marginRight: 8,
                    background: selectBg,
                    color: selectColor,
                    border: `1px solid ${selectBorder}`,
                    padding: '6px 8px',
                    borderRadius: 6,
                  }}
                >
                  <option value="csv">CSV</option>
                  <option value="xlsx">XLSX</option>
                </select>
                <Button
                  mt="2"
                  mr="2"
                  colorScheme="teal"
                  onClick={exportData}
                  disabled={filteredData.length === 0}
                >
                  Download
                </Button>
              </Flex>
            </Flex>
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
            {hasFilteredData ? (
              <MQ135Chart data={mq135Data} />
            ) : (
              <Box h="360px" display="flex" alignItems="center" justifyContent="center">
                <Text>No data for the selected date range</Text>
              </Box>
            )}
          </Box>
        </GridItem>

        {/* MQ2 Chart */}
        <GridItem>
          <Box h="440px" p="0" border="solid 1px" borderRadius="15px" borderColor="InactiveBorder" shadow="lg">
            <Text textAlign="center" mt="2" mb="2" fontWeight="bold">MQ2 Readings (PPM):</Text>
            {hasFilteredData ? (
              <MQ2Chart data={mq2Data} />
            ) : (
              <Box h="360px" display="flex" alignItems="center" justifyContent="center">
                <Text>No data for the selected date range</Text>
              </Box>
            )}
          </Box>
        </GridItem>

        {/* DHT11 Chart */}
        <GridItem>
          <Box h="440px" p="0" border="solid 1px" borderRadius="15px" borderColor="InactiveBorder" shadow="lg">
            <Text textAlign="center" mt="2" mb="2" fontWeight="bold">DHT11 Readings (°C / %):</Text>
            {hasFilteredData ? (
              <DHT11Chart data={dhtData} />
            ) : (
              <Box h="360px" display="flex" alignItems="center" justifyContent="center">
                <Text>No data for the selected date range</Text>
              </Box>
            )}
          </Box>
        </GridItem>

        {/* Air Quality Score */}
        <GridItem>
          <Box h="440px" p="0" border="solid 1px" borderRadius="15px" borderColor="InactiveBorder" shadow="lg">
            <Text textAlign="center" mt="2" mb="2" fontWeight="bold">Average Air Quality Score (%):</Text>
            {hasFilteredData ? (
              <>
                <QualityScoreChart score={100 - avgAirQualityScore} />
                <Box textAlign={"center"} mt='20'>
                  <Text fontSize="xl"> Average Air Quality Score: {(avgAirQualityScore)} %</Text>
                </Box>
              </>
            ) : (
              <Box h="360px" display="flex" alignItems="center" justifyContent="center">
                <Text>No data for the selected date range</Text>
              </Box>
            )}
          </Box>
        </GridItem>

        {/* Air Quality Bar Chart */}
        <GridItem>
          <Box h="440px" p="0" border="solid 1px" borderRadius="15px" borderColor="InactiveBorder" shadow="lg">
            <Text textAlign="center" mt="2" mb="2" fontWeight="bold">Air Quality Score (%):</Text>
            {hasFilteredData ? (
              <QualityBarChart data={airQualityScores} />
            ) : (
              <Box h="360px" display="flex" alignItems="center" justifyContent="center">
                <Text>No data for the selected date range</Text>
              </Box>
            )}
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
}
