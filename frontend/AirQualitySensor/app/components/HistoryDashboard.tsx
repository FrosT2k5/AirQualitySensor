import {
  Grid,
  GridItem,
  Box,
  Image,
  Text,
  Button,
  VStack,
  HStack,
  Link,
  Heading,
  Container,
} from "@chakra-ui/react";
import { useConnection } from "./ui/ConnectionContext";
import { onlineState } from "~/helpers";

export default function HistoryDashboard() {
  const { setConnectionState } = useConnection();

  // Update connection state, shown in navbar
  setConnectionState((state) =>
    state === onlineState.online ? onlineState.online : onlineState.offline
  );

  return (
    <></>
    );
}
