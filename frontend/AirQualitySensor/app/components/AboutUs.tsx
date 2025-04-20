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

const teamMembers = [
  {
    name: "Yash Patil",
    image: "/yash.svg",
    description:
      "I'm passionate about Programming, sci-fi, OpenSource and Philosophy while also Reading books.",
    college: "KC College Of Engineering, Thane",
    github: "https://github.com/FrosT2k5",
    email: "yashpatil2022@kccemsr.edu.in",
  },
  {
    name: "Sairaj Pai",
    image: "/sairaj.svg",
    description:
      "I'm passionate about tabla, sci-fi, sitcoms, and movies, while also exploring coding and embracing diverse experiences.",
    college: "KC College Of Engineering, Thane",
    github: "https://github.com/gegendepressed",
    email: "sairajpai2022@kccemsr.edu.in",
  },
  {
    name: "Nandini Nichite",
    image: "/nandini.svg",
    description:
      "Passionate about reading books and diving into coding, exploring new realms in literature and technology with enthusiasm.",
    college: "KC College Of Engineering, Thane",
    github: "https://github.com/NandiniNichite",
    email: "nandininichite2022@kccemsr.edu.in",
  },
];

export default function AboutUs() {
  const { setConnectionState } = useConnection();

  // Update connection state, shown in navbar
  setConnectionState((state) =>
    state === onlineState.online ? onlineState.online : onlineState.offline
  );

  return (
    <Container mt="4">
      <Heading textStyle="3xl" fontWeight="bold" mb="5">
        About: -- Team CodeForcers --
      </Heading>
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
        {teamMembers.map((member) => (
          <GridItem key={member.name}>
            <Box boxShadow="md" borderRadius="15px" border="solid 1px"  borderColor="InactiveBorder" p={6} textAlign="center">
              <VStack m={4}>
                <Image
                  src={member.image}
                  alt={member.name}
                  borderRadius="full"
                  boxSize="150px"
                  objectFit="cover"
                />
                <Text fontSize="2xl" fontWeight="bold">
                  {member.name}
                </Text>
                <Text fontSize="md" fontWeight="light">
                  {member.description}
                </Text>
                <Text fontSize="sm" fontWeight="lighter">
                  {member.college}
                </Text>
                <HStack m={4}>
                  <Link href={member.github} target="_blank">
                    <Button colorScheme="blue">Follow</Button>
                  </Link>
                  <Link href={`mailto:${member.email}`}>
                    <Button variant="outline" colorScheme="blue">
                      Message
                    </Button>
                  </Link>
                </HStack>
              </VStack>
            </Box>
          </GridItem>
        ))}
      </Grid>
    </Container>
  );
}
