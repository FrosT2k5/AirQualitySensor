"use client";

import { 
  Box, 
  Drawer, 
  DrawerContent, 
  Flex, 
  useDisclosure, 
  Text, 
  CloseButton, 
  IconButton, 
  type FlexProps, 
  Link,
  Stack,
  ClientOnly,
  Skeleton,
} from "@chakra-ui/react";

import { FiMenu } from "react-icons/fi";
import { NavLink } from "react-router"; // Ensure correct import
import { useColorModeValue, ColorModeButton, useColorMode } from "./ui/color-mode";

const LinkItems = [
  { name: "Dashboard", to: "/" },
  { name: "Settings", to: "/settings" },
  { name: "About", to: "/about" },
];

interface SidebarProps {
  onClose: () => void;
  display?: object;
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const bgColor = useColorModeValue("gray.300", "#000000");
  const borderColor = useColorModeValue("gray.300", "#222222");
  const textColor = useColorModeValue("black", "white");
  const hoverBg = useColorModeValue("gray.400", "#111111");

  return (
    <ClientOnly fallback={<Skeleton boxSize="8" />}>
      <Box
        bg={bgColor}
        color={textColor}
        borderRight="1px"
        borderRightColor={borderColor}
        w={{ base: "full", md: 72 }}
        pos="fixed"
        h="full"
        {...rest}
      >
        <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
          <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
            Logo
          </Text>
          <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
        </Flex>

        <Stack ms="6" me="6" p="2">
          {LinkItems.map((link) => (
            <Link
              key={link.name}
              css={{ "--border-color": "colors.colorPalette.400" }}
              as={(props) => (
                <NavLink {...props}
                to={link.to}
                style={( {isActive} ) => isActive ? 
                  {
                    fontWeight: "bolder",
                    border: "solid",
                    borderRadius: "12px",
                  } : {}}>
                  {link.name}
                </NavLink>
              )}
              px="4"
              py="2"
              transition="background 0.2s"
              _hover={{ bg: hoverBg, color: textColor }}
            />
          ))}
          <Text px="4" py="2"> 
            Theme: <ColorModeButton variant="ghost" />
          </Text>
          
        </Stack>
      </Box>
    </ClientOnly>
  );
};

interface MobileProps extends FlexProps {
  onOpen: () => void;
}

const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  const bgColor = useColorModeValue("gray.100", "#000000");
  const borderColor = useColorModeValue("gray.300", "#222222");
  const textColor = useColorModeValue("black", "white");

  return (
    <ClientOnly fallback={<Skeleton boxSize="8" />}>
      <Flex
        ml={{ base: 0, md: 60 }}
        px={{ base: 4, md: 24 }}
        height="20"
        alignItems="center"
        bg={bgColor}
        color={textColor}
        borderBottomWidth="1px"
        borderBottomColor={borderColor}
        justifyContent="flex-center"
        {...rest}
      >
        <IconButton
          variant="outline"
          color={textColor}
          borderColor={borderColor}
          onClick={onOpen}
          aria-label="open menu"> 
          <FiMenu />
        </IconButton>

        <Text fontSize="2xl" ml="8" fontFamily="monospace" fontWeight="bold" display={"inline"} textAlign="center">
          Logo
        </Text>
      </Flex>
    </ClientOnly>
  );
};

export default function Navbar() {
  const { open, onOpen, onClose } = useDisclosure(); // Keeping `open` as per your Chakra version

  return (
    <>
      {/* Sidebar for Desktop */}
      <SidebarContent onClose={onClose} display={{ base: "none", md: "block" }} />

      {/* Drawer for Mobile */}
      <Drawer.Root open={open} placement="start" onOpenChange={onClose} size="full">
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer.Root>

      {/* Mobile Navigation */}
      <MobileNav onOpen={onOpen} display={{ base: "flex", md: "none" }}/>
    </>
  );
}