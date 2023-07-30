import React from "react";
import { navigate } from "gatsby";
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
import { getCookie } from "../cookie-manager";
import PawtnerLogo from "../images/logo.inline.svg";
import ArrowUpIcon from "../images/icons/arrow-up.inline.svg";
import FavoriteIcon from "../images/icons/favorite.inline.svg";
import MenuIcon from "../images/icons/menu.inline.svg";

const Header = () => {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } =
    useAuth0();
  const role = user ? getCookie(`role|${user.email}`) : "";
  console.log(user, role, isLoading, "user role");

  const headerHeights = { base: "70px", md: "100px", "2xl": "122px" };

  return (
    <Flex>
      <Center h={headerHeights}>
        <PawtnerLogo
          width="183px"
          cursor="pointer"
          onClick={() => navigate("/")}
        />
      </Center>

      <Spacer />

      <Hide below="md">
        <Wrap justify={{ base: "left", md: "right" }}>
          <Center h={headerHeights} px="30px">
            <Select
              icon={<ArrowUpIcon />}
              placeholder="ALL ABOUT PUPPY &emsp;"
              border={0}
            />
            <Box display="flex" ml="3rem">
              <FavoriteIcon />
            </Box>
          </Center>
        </Wrap>
        <Wrap>
          <Center h={headerHeights} borderLeft="1px" borderColor="gray.200">
            {!isAuthenticated ? (
              <Text fontWeight={600} mx="30px">
                <Link href="#" onClick={loginWithRedirect}>
                  Log In
                </Link>
              </Text>
            ) : (
              <>
                {!isLoading && (
                  <Text mx="30px" fontWeight={600}>
                    <Link href={role == "breeder" ? "/breeder-profile" : "#"}>
                      Account
                    </Link>
                  </Text>
                )}
                <Text mr="10px">
                  <Link href="#" onClick={logout}>
                    Log Out
                  </Link>
                </Text>
              </>
            )}
          </Center>
        </Wrap>
      </Hide>
      <Show below="md">
        <Center h="70px" pt={1}>
          <FavoriteIcon />
          <Select icon={<Icon as={MenuIcon} />} size="sm" width={9} border={0}>
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
