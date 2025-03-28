"use client";

import { Box, Container, Grid, GridItem, Heading, Text } from '@chakra-ui/react'
import {  useEffect } from 'react';
import MQ135Chart from './MQ135Chart';
import { config, sensorData} from './helpers';
import MQ2Chart from './MQ2Chart';
import DHT11Chart from './DHTChart';
import { useRevalidator } from 'react-router';
import { useConnection } from './ui/ConnectionContext';

type Props = {
  children?: React.ReactNode,
}

function ChartBox({children}: Props ) {
  return <Box h="440px" p="0" border="solid 1px" borderRadius="15px" borderColor="InactiveBorder" shadow="lg">
    {children}
  </Box>
}

function Dashboard({}: Props) {
  const revalidator = useRevalidator();
  const { setConnectionState } = useConnection();

  // Update connection state, shown in navbar
  setConnectionState(sensorData.isOnline);
  
  useEffect(() => {
    const updateData = async () => {
      revalidator.revalidate();
    };
  
    updateData(); // Fetch once on mount
    const interval = setInterval(updateData, config.samplingRate);
  
    return () => clearInterval(interval); // Cleanup function
  }, [config.samplingRate]);
  
  return (
    <Container mt="4"> 
      <Heading textStyle="3xl" fontWeight="bold" mb="5">Dashboard</Heading>
      <Grid templateColumns={{base: "repeat(1, 1fr)", md: "repeat(4, 1fr)"}} gap="6">

        <GridItem colSpan={2}>
          <ChartBox> 
            <Text textAlign="center" mt="2" mb="2" fontWeight="bold"> MQ135 Readings (PPM): </Text>
            <MQ135Chart data={sensorData["MQ135"]}/>
          </ChartBox>
        </GridItem>

        <GridItem colSpan={2}>
          <ChartBox> 
          <Text textAlign="center" mt="2" mb="2" fontWeight="bold"> MQ2 Readings (PPM): </Text>
            <MQ2Chart data={sensorData["MQ2"]}/>
          </ChartBox>
        </GridItem>

        <GridItem colSpan={2}>
        <ChartBox> 
        <Text textAlign="center" mt="2" mb="2" fontWeight="bold"> DHT11 Readings (°C/%): </Text>
            <DHT11Chart data={sensorData["DHT11"]}/>
          </ChartBox>
        </GridItem>

        <GridItem colSpan={2}>
          <ChartBox>
            <Box p="7">
              <Text textAlign="center" mt="2" mb="2" fontSize="2xl" fontWeight="bold"> Raw Data: </Text>
              <Text fontSize="xl"> MQ135 Raw: {sensorData.rawData.MQ135.Raw} </Text>
              <Text fontSize="xl"> MQ2 Raw: {sensorData.rawData.MQ2.Raw} </Text>
              <Text fontSize="xl"> Temperature: {sensorData.rawData.DHT11.temperature} °C </Text>
              <Text fontSize="xl"> Humididity: {sensorData.rawData.DHT11.humidity} % </Text>
              <Text fontSize="xl"> Time: {new Date().toLocaleTimeString()} </Text>
              <Text fontSize="xl"> Update Rate: {config.samplingRate/1000} s</Text>
            </Box>
          </ChartBox>
        </GridItem>
      </Grid>
    </Container>
  )
}

export default Dashboard