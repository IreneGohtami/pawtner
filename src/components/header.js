import React, { useState, useEffect } from "react";
import { isEmpty } from "lodash";
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
import { useLocation } from "@reach/router";
import { getCookie, deleteCookie } from "../cookie-manager";

import PawtnerLogo from "../images/logo.inline.svg";
import ArrowUpIcon from "../images/icons/arrow-up.inline.svg";
import FavoriteIcon from "../images/icons/favorite.inline.svg";
import MenuIcon from "../images/icons/menu.inline.svg";

const Header = ({ authorizedRole, openSelectOptionModal, bg }) => {
  const location = useLocation();
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();
  const [role, setRole] = useState([]);

  const headerHeights = { base: "70px", md: "100px", "2xl": "122px" };
  const isProfilePage = location.pathname === "/breeder-profile/";
  const isAdminPage = location.pathname === "/admin/";

  useEffect(() => {
    if (user) {
      let roles = user?.["https://pawtner.gatsbyjs.io/roles"] || [];
      if (!roles.length) {
        // Try to check cookie
        roles = getCookie(`role|${user.email}`);
        roles = !isEmpty(roles) ? JSON.parse(roles) : [];
        console.log(roles, "roles from cookie");
        if (
          authorizedRole === "all" &&
          !roles.length &&
          openSelectOptionModal
        ) {
          openSelectOptionModal();
        }
      }
      console.log(user, roles, "user");
      setRole(roles || []);

      if (!roles.includes(authorizedRole) && authorizedRole !== "all") {
        navigate("/");
        return;
      }
    }
  }, [user]);

  return (
    <Flex bg={bg || "none"} px="40px">
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
                {role.includes("admin") && (
                  <Text ml="30px" fontWeight={isAdminPage ? 600 : 400}>
                    <Link href="/admin">Admin Panel</Link>
                  </Text>
                )}
                <Text mx="30px" fontWeight={isProfilePage ? 600 : 400}>
                  <Link
                    href={role.includes("breeder") ? "/breeder-profile" : "/"}
                  >
                    Account
                  </Link>
                </Text>
                <Text mr="10px">
                  <Link
                    href="#"
                    onClick={() => {
                      deleteCookie(`role|${user.email}`);
                      logout();
                    }}
                  >
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
          <Select
            icon={<Icon as={MenuIcon} />}
            size="sm"
            width={9}
            border={0}
            cursor="pointer"
          >
            {!isAuthenticated ? (
              <option onClick={loginWithRedirect}>Log In</option>
            ) : (
              <>
                {role.includes("admin") && (
                  <option onClick={() => navigate("/admin")}>
                    Admin Panel
                  </option>
                )}
                <option
                  onClick={() => {
                    role.includes("breeder")
                      ? navigate("/breeder-profile")
                      : navigate("/");
                  }}
                >
                  Account
                </option>
                <option
                  onClick={() => {
                    deleteCookie(`role|${user.email}`);
                    logout();
                  }}
                >
                  Log Out
                </option>
              </>
            )}
            <option>ALL ABOUT PUPPY</option>
          </Select>
        </Center>
      </Show>
    </Flex>
  );
};

export default Header;
