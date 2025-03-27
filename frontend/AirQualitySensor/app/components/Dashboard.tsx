"use client";

import { Box, Container, Grid, GridItem, Heading, Text } from '@chakra-ui/react'
import { useState, type ReactNode, useEffect } from 'react';
import MQ135Chart from './MQ135Chart';
import type { JSX } from 'react/jsx-runtime';
import { config, fetchSensorData } from './helpers';
import MQ2Chart from './MQ2Chart';
import DHT11Chart from './DHTChart';

type Props = {
  children?: React.ReactNode,
}

type MQ135Data = {
  CO2: number;
  CO: number;
  Alcohol: number;
};

type MQ2Data = {
  LPG: number;
  CO: number; // Renaming CO_MQ2 to CO
  Propane: number;
};

type DHT11Data = {
  Temperature: number;
  Humidity: number;
};

export type SensorData = {
  name: string; // Timestamp
} & (MQ135Data | MQ2Data | DHT11Data);


function ChartBox({children}: Props ) {
  return <Box h="440px" p="0" border="solid 1px" borderRadius="15px">
    {children}
  </Box>
}

function Dashboard({}: Props) {

  const [sensorData, setSensorData] = useState<{
    MQ135: SensorData[];
    MQ2: SensorData[];
    DHT11: SensorData[];
  }>({
    MQ135: [],
    MQ2: [],
    DHT11: [],
  });

  useEffect(() => {
    const updateData = async () => {
      const data = await fetchSensorData();
      console.log(data);
      if (data) {
        setSensorData((prevData) => ({
          MQ135: [...prevData.MQ135.slice(-14), { name: new Date().toLocaleTimeString(), ...data.MQ135 }],
          MQ2: [...prevData.MQ2.slice(-14), { name: new Date().toLocaleTimeString(), ...data.MQ2 }],
          DHT11: [...prevData.DHT11.slice(-14), { name: new Date().toLocaleTimeString(), ...data.DHT11 }],
        }));
      }
    };
  
    updateData(); // Fetch once on mount
    const interval = setInterval(updateData, config.samplingRate); // Update every 5 sec
  
    return () => clearInterval(interval); // Cleanup function
  }, [config.samplingRate]);
  
  return (
    <Container mt="4"> 
      <Heading textStyle="3xl" fontWeight="bold" mb="5">Dashboard</Heading>
      <Grid templateColumns={{base: "repeat(1, 1fr)", md: "repeat(4, 1fr)"}} gap="6">

        <GridItem colSpan={2}>
          <ChartBox> 
            <Text textAlign="center" mt="2" mb="2"> MQ135 Readings: </Text>
            <MQ135Chart data={sensorData["MQ135"]}/>
          </ChartBox>
        </GridItem>

        <GridItem colSpan={2}>
          <ChartBox> 
          <Text textAlign="center" mt="2" mb="2"> MQ2 Readings: </Text>
            <MQ2Chart data={sensorData["MQ2"]}/>
          </ChartBox>
        </GridItem>

        <GridItem colSpan={2}>
        <ChartBox> 
        <Text textAlign="center" mt="2" mb="2"> DHT11 Readings: </Text>
            <DHT11Chart data={sensorData["DHT11"]}/>
          </ChartBox>
        </GridItem>

        <GridItem colSpan={2}>
          <ChartBox />
        </GridItem>
      </Grid>
    </Container>
  )
}

export default Dashboard