import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
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
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const roles = user?.["https://pawtner.gatsbyjs.io/roles"] || [];
  console.log(user, roles, "user");
  if (!roles.length) {
    console.log("no roles");
  }

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
            {/*<Text mx="30px">
              <Link href="#">Sign Up</Link>
            </Text>*/}
            {!isAuthenticated ? (
              <Text fontWeight={600} mx="30px">
                <Link href="#" onClick={loginWithRedirect}>
                  Log In
                </Link>
              </Text>
            ) : (
              <Text fontWeight={600} mx="30px">
                <Link href="#" onClick={logout}>
                  Log Out
                </Link>
              </Text>
            )}
          </Center>
        </Wrap>
      </Hide>
      <Show below="md">
        <Center h="70px" pt={1}>
          <FavoriteIcon />
          <Select icon={<Icon as={MenuIcon} />} size="sm" width={9} border={0}>
            {/*<option>
              <Link href="#">Sign Up</Link>
            </option>*/}
            {!isAuthenticated ? (
              <option>
                <Link href="#" onClick={loginWithRedirect}>
                  Log In
                </Link>
              </option>
            ) : (
              <option>
                <Link href="#" onClick={logout}>
                  Log Out
                </Link>
              </option>
            )}
            <option>ALL ABOUT PUPPY</option>
          </Select>
        </Center>
      </Show>
    </Flex>
  );
};

export default Header;
