"use client";

import {
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Skeleton,
  SkeletonText,
  Slider,
  Spinner,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react";
import { Form, useFetcher, useRevalidator } from "react-router";
import { calibrateRequest, config, onlineState, type BuzzerConfigResponse } from "../helpers";
import { useState } from "react";
import { useConnection } from "./ui/ConnectionContext";

type Props = {
  children?: React.ReactNode;
  h?: string;
  loaderData?: BuzzerConfigResponse | null;
};

function SettingsBox({ children, h }: Props) {
  return (
    <Box
      minH={h}
      p="8"
      border="solid 1px"
      borderRadius="15px"
      borderColor="InactiveBorder"
      shadow="lg"
    >
      {children}
    </Box>
  );
}

export function SettingsSkeleton() {
  return (
    <Container mt="4">
      <Heading textStyle="3xl" fontWeight="bold" mb="5">
        <Skeleton h="40px" w="200px" />
      </Heading>

      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(4, 1fr)" }} gap="6">
        
        {/* Configuration Form Skeleton */}
        <GridItem colSpan={2}>
          <SettingsBox h="700px">
            <SkeletonText h="20px" mb="4" />
            
            <Skeleton h="40px" w="100%" mb="3" /> {/* IP Address Input */}
            
            <Stack direction="row" justifyContent="space-between">
              <Skeleton h="20px" w="150px" />
              <Skeleton h="30px" w="50px" />
            </Stack>

            <Skeleton h="40px" w="100%" mt="3" /> {/* MQ135 Input */}
            <Skeleton h="40px" w="100%" mt="3" /> {/* MQ2 Input */}

            <Stack direction="row" justifyContent="space-between" mt="3">
              <Skeleton h="20px" w="200px" />
              <Skeleton h="30px" w="50px" />
            </Stack>

            <Skeleton h="40px" w="100%" mt="3" /> {/* R0 MQ135 */}
            <Skeleton h="40px" w="100%" mt="3" /> {/* R0 MQ2 */}
            <Skeleton h="40px" w="100%" mt="3" /> {/* Graph Update Interval */}

            <Stack mx="20">
              <Skeleton h="50px" w="150px" mt="8" /> {/* Submit Button */}
            </Stack>
          </SettingsBox>
        </GridItem>

        {/* Configuration Details Skeleton */}
        <GridItem colSpan={2}>
          <SettingsBox h="500px">
            <Box p="7">
              <Skeleton h="30px" w="250px" mb="4" />
              
              <Skeleton h="20px" w="200px" mb="2" />
              <Skeleton h="20px" w="250px" mb="2" />
              <Skeleton h="20px" w="300px" mb="2" />
              <Skeleton h="20px" w="250px" mb="2" />
              <Skeleton h="20px" w="300px" mb="2" />
              <Skeleton h="20px" w="250px" mb="2" />
              <Skeleton h="20px" w="300px" mb="2" />
              <Skeleton h="20px" w="200px" mb="2" />
              
              <Skeleton h="20px" w="250px" mt="2" />
              <Skeleton h="50px" w="180px" mt="3" /> {/* Calibrate Button */}
            </Box>
          </SettingsBox>
        </GridItem>

      </Grid>
    </Container>
  );
}

export function SettingsPage({ loaderData }: Props) {
  let initialBuzz = false;
  let initialDebug = false;
  
  const { setConnectionState } = useConnection();
  let { revalidate } = useRevalidator();
  let fetcher = useFetcher();
  let [ calibratorBusy, setCalibratorBusy ] = useState(false);

  let busy = fetcher.state !== "idle";

  if (loaderData?.buzzer.status) initialBuzz = true;
  if (loaderData?.config.ENABLE_SERIAL_DEBUG) initialBuzz = true;

  if (loaderData) setConnectionState(onlineState.online);
  else setConnectionState(onlineState.offline);

  const [enableBuzzer, setEnableBuzzer] = useState(initialBuzz);
  const [enableDebug, setEnableDebug] = useState(initialDebug);
  const [interval, setInterval] = useState([config.samplingRate / 1000]);

  async function calibrateSensors() {
    setCalibratorBusy(true); // Mark the form as busy
    await calibrateRequest();
    setCalibratorBusy(false);
    // reload data after calibrating
    revalidate();
  }

  return (
    <Container mt="4">
      <Heading textStyle="3xl" fontWeight="bold" mb="5">
        Settings
      </Heading>
      <Grid
        templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(4, 1fr)" }}
        gap="6"
      >
        <GridItem colSpan={2}>
          <SettingsBox h="700px">
            <Text textAlign="center" mb="2" fontWeight="bold">
              Configuration:
            </Text>

            <fetcher.Form method="post" action="/settings">
              <Text fontWeight="bold" fontSize="md">
                IP Address of ESP32:
              </Text>
              <Input
                type="text"
                name="ipAddr"
                defaultValue={config.apiHost}
                mb="3"
              />

              <input
                type="hidden"
                name="enableBuzzer"
                value={enableBuzzer == true ? "enable" : "disable"}
              />
              <Stack direction="row" justifyContent="space-between">
                <Text fontWeight="bold" fontSize="md" display="inline" mr="5">
                  Enable Buzzer:
                </Text>
                <Switch.Root
                  checked={enableBuzzer}
                  onCheckedChange={(e) => setEnableBuzzer(e.checked)}
                >
                  <Switch.HiddenInput />
                  <Switch.Control />
                </Switch.Root>
              </Stack>

              <Text fontWeight="bold" fontSize="md" mt="3">
                MQ135 Buzzer Limit:
              </Text>
              <Input
                type="number"
                name="MQ135_BUZZ_VALUE"
                defaultValue={loaderData?.buzzer.MQ135_BUZZ_VALUE}
              />

              <Text fontWeight="bold" fontSize="md" mt="3">
                MQ2 Buzzer Limit:
              </Text>
              <Input
                type="number"
                name="MQ2_BUZZ_VALUE"
                defaultValue={loaderData?.buzzer.MQ2_BUZZ_VALUE}
              />

              <input
                type="hidden"
                name="ENABLE_SERIAL_DEBUG"
                value={enableDebug ? "enable" : "disable"}
              />
              <Stack direction="row" justifyContent="space-between">
                <Text fontWeight="bold" fontSize="md" mt="3">
                  Enable Serial Debugging:
                </Text>
                <Switch.Root
                  checked={enableDebug}
                  onCheckedChange={(e) => setEnableDebug(e.checked)}
                >
                  <Switch.HiddenInput />
                  <Switch.Control />
                </Switch.Root>
              </Stack>

              <Text fontWeight="bold" fontSize="md" mt="3">
                MQ135 Calibration Value:
              </Text>
              <Input
                type="number"
                step="any"
                name="R0_MQ135"
                defaultValue={loaderData?.config.R0_MQ135}
              />

              <Text fontWeight="bold" fontSize="md" mt="3">
                MQ2 Calibration Value:
              </Text>
              <Input
                type="number"
                step="any"
                name="R0_MQ2"
                defaultValue={loaderData?.config.R0_MQ2}
              />

              <Text fontWeight="bold" fontSize="md" mt="3">
                Graph Update Interval:
              </Text>
              <Slider.Root
                width="100%"
                value={interval}
                step={5}
                onValueChange={(e) => setInterval(e.value)}
              >
                <input
                  type="hidden"
                  name="samplingRate"
                  value={interval[0] * 1000}
                />
                <HStack justify="space-between">
                  <Slider.Label>Time between graph updates</Slider.Label>
                  <Slider.ValueText />
                </HStack>
                <Slider.Control>
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumbs />
                </Slider.Control>
              </Slider.Root>

              <Stack mx="20">
                <Button type="submit" mt="8" disabled={calibratorBusy || busy}>
                  {busy ? <> Submitting... <Spinner /> </>  : "Submit"}
                </Button>
              </Stack>
            </fetcher.Form>
          </SettingsBox>
        </GridItem>

        <GridItem colSpan={2}>
          <SettingsBox h="500px">
            <Box p="7">
              <Text textAlign="center" mt="2" mb="4" fontSize="2xl" fontWeight="bold">
                Configuration Settings
              </Text>

              <Text fontSize="xl"> IP Address: {config.apiHost} </Text>
              <Text fontSize="xl"> Buzzer: {loaderData?.buzzer.status ? "Enabled" : "Disabled"} </Text>
              <Text fontSize="xl"> MQ135 Buzz Threshold: {loaderData?.buzzer.MQ135_BUZZ_VALUE} </Text>
              <Text fontSize="xl"> MQ2 Buzz Threshold: {loaderData?.buzzer.MQ2_BUZZ_VALUE} </Text>
              <Text fontSize="xl"> Serial Debug: {loaderData?.config.ENABLE_SERIAL_DEBUG ? "Enabled" : "Disabled"} </Text>
              <Text fontSize="xl"> R0 MQ135: {loaderData?.config.R0_MQ135} </Text>
              <Text fontSize="xl"> R0 MQ2: {loaderData?.config.R0_MQ2} </Text>
              <Text fontSize="xl"> Update Rate: {config.samplingRate / 1000} s</Text>
              <Text fontSize="xl" mt="2"> Press the button below to calibrate sensors: </Text>
              <Button onClick={() => calibrateSensors()} disabled={calibratorBusy || busy}>
                {calibratorBusy ? <> Calibrating... <Spinner /> </>  : "Calibrate"}  
              </Button>
            </Box>
          </SettingsBox>
        </GridItem>
      </Grid>
    </Container>
  );
}
