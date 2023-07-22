import React from "react";
import {
  Box,
  Center,
  Flex,
  Hide,
  Icon,
  Link,
  Select,
  Show,
  Spacer,
  Text,
  Wrap,
} from "@chakra-ui/react";
import PawtnerLogo from "../images/logo.inline.svg";
import ArrowUpIcon from "../images/icons/arrow-up.inline.svg";
import FavoriteIcon from "../images/icons/favorite.inline.svg";
import MenuIcon from "../images/icons/menu.inline.svg";

const Header = () => {
  const headerHeights = { base: "70px", md: "100px", "2xl": "122px" };

  return (
    <Flex>
      <Center h={headerHeights}>
        <PawtnerLogo width="183px" />
      </Center>

      <Spacer />

      <Hide below="md">
        <Wrap justify={{ base: "left", md: "right" }}>
          <Center h={headerHeights} px="30px">
            <Select
              icon={<ArrowUpIcon />}
              placeholder="ALL ABOUT PUPPY &emsp;&emsp;&emsp;"
              border={0}
            />
            <Box display="flex" ml="3rem">
              <FavoriteIcon />
            </Box>
          </Center>
        </Wrap>
        <Wrap>
          <Center h={headerHeights} borderLeft="1px" borderColor="gray.200">
            <Text mx="30px">
              <Link href="#">Sign Up</Link>
            </Text>
            <Text fontWeight={600} mr="10px">
              <Link href="/login">Log In</Link>
            </Text>
          </Center>
        </Wrap>
      </Hide>
      <Show below="md">
        <Center h="70px" pt={1}>
          <FavoriteIcon />
          <Select icon={<Icon as={MenuIcon} />} size="sm" width={9} border={0}>
            <option>
              <Link href="#">Sign Up</Link>
            </option>
            <option>
              <Link href="/login">Log In</Link>
            </option>
            <option>ALL ABOUT PUPPY</option>
          </Select>
        </Center>
      </Show>
    </Flex>
  );
};

export default Header;
