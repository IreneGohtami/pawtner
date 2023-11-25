import React, { useState, useEffect } from "react";
import { isEmpty } from "lodash";
import { navigate } from "gatsby";
import { SettingOutlined } from "@ant-design/icons";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Box,
  Center,
  Flex,
  Hide,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Show,
  Spacer,
  Text,
  Wrap,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useLocation } from "@reach/router";
import { getCookie, deleteCookie } from "../cookie-manager";

import PawtnerLogo from "../images/logo.inline.svg";
import FavoriteIcon from "../images/icons/favorite.inline.svg";

const Header = ({ authorizedRole, openSelectOptionModal, bg }) => {
  const location = useLocation();
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();
  const [role, setRole] = useState([]);

  const headerHeights = { base: "70px", md: "100px", "2xl": "122px" };
  const isProfilePage = location.pathname === "/account/breeder-profile/";
  const isAdminPage = location.pathname === "/admin/";

  useEffect(() => {
    if (user) {
      let roles = user?.["https://pawtner.gatsbyjs.io/roles"] || [];
      if (!roles.length) {
        // Try to check cookie
        roles = getCookie(`role|${user.email}`);
        roles = !isEmpty(roles) ? JSON.parse(roles) : [];
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
        <Wrap justify={{ base: "left", md: "right" }} h={headerHeights}>
          <Center h={headerHeights} px="30px">
            <Link href="/dogs" fontWeight={600}>
              Puppies for Sale
            </Link>
            <Box display="flex" ml="2rem">
              <FavoriteIcon
                cursor="pointer"
                onClick={() => navigate("/favorites")}
              />
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
                    <Link href="/admin">
                      <SettingOutlined />
                    </Link>
                  </Text>
                )}
                <Text mx="30px" fontWeight={isProfilePage ? 600 : 400}>
                  <Link
                    href={
                      role.includes("breeder")
                        ? "/account/breeder-profile"
                        : "/account/buyer-profile"
                    }
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
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<HamburgerIcon />}
              variant="ghost"
            />
            <MenuList>
              {!isAuthenticated ? (
                <MenuItem onClick={loginWithRedirect}>Log In</MenuItem>
              ) : (
                <>
                  <MenuItem onClick={() => navigate("/admin")}>
                    Admin Panel
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      role.includes("breeder")
                        ? navigate("/account/breeder-profile")
                        : navigate("/account/buyer-profile");
                    }}
                  >
                    Account
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      deleteCookie(`role|${user.email}`);
                      logout();
                    }}
                  >
                    Log Out
                  </MenuItem>
                </>
              )}
              <MenuItem onClick={() => navigate("/favorites")}>
                Favorites
              </MenuItem>
              <MenuItem onClick={() => navigate("/dogs")}>
                Puppies for Sale
              </MenuItem>
            </MenuList>
          </Menu>
        </Center>
      </Show>
    </Flex>
  );
};

export default Header;
