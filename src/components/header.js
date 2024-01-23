import React, { useState, useEffect } from "react";
import { isEmpty } from "lodash";
import { navigate } from "gatsby";
import { HeartFilled, SettingOutlined } from "@ant-design/icons";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Box,
  Center,
  Circle,
  Flex,
  Hide,
  IconButton,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Show,
  Spacer,
  Text,
  Wrap,
  useDisclosure,
} from "@chakra-ui/react";
import { BellIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useLocation } from "@reach/router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { getCookie, deleteCookie, setCookie } from "../cookie-manager";

import ChatPage from "../components/chat";
import FavoriteIcon from "../images/icons/favorite.inline.svg";

const Header = ({
  authorizedRole,
  openSelectOptionModal,
  bg,
  userMetadata,
}) => {
  const location = useLocation();
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [role, setRole] = useState([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);

  const headerHeights = { base: "70px", md: "100px", "2xl": "122px" };
  const isProfilePage = location.pathname === "/account/breeder-profile/";
  const isAdminPage = location.pathname === "/admin/";
  const isAccountPage = location.pathname.startsWith("/account/");

  useEffect(() => {
    const firstTime = getCookie("firstTime");
    if (firstTime) {
      setShowFirstTimeModal(true);
      setCookie("firstTime", true, 30);
    }

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
      //console.log(user, roles, "user");
      setRole(roles || []);

      if (!roles.includes(authorizedRole) && authorizedRole !== "all") {
        navigate("/");
        return;
      }

      fetchConversation();
    }
  }, [user]);

  const fetchConversation = async () => {
    if (isAuthenticated && user) {
      const userId = user.sub.split("|")[1];

      try {
        // Filter query based on participants user_id
        const q = query(
          collection(db, "chat_history"),
          where("participants.user_ids", "array-contains-any", [userId])
        );
        const querySnapshot = await getDocs(q);

        let _unreadMessageCount = 0;
        querySnapshot.forEach((doc) => {
          const { messages } = doc.data();
          _unreadMessageCount += messages.filter(
            (_message) => !_message.read && _message.sender_id !== userId
          ).length;
        });

        setUnreadMessageCount(_unreadMessageCount);
      } catch (error) {
        console.log(error, "error fetching conversation");
      }
    }
  };

  return (
    <Flex bg={bg || "none"} px="40px">
      <Center h={headerHeights}>
        <IconButton
          icon={<Image src="/logo.png" width="210px" />}
          colorScheme="transparent"
          onClick={() => navigate("/")}
        />
      </Center>

      <Spacer />

      {/* Chat modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ChatPage
          breederId={user?.sub.split("|").pop() || ""}
          breederInfo={userMetadata || {}}
        />
      </Modal>

      {/* First time visit modal */}
      <Modal
        isOpen={showFirstTimeModal}
        size="md"
        onClose={() => {
          setShowFirstTimeModal(false);
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Welcome to Pawtner!</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Pawtner is a platform that connects breeders and buyers. We are
              here to help you find your perfect puppy! However, consider
              adopting a pet from a shelter or rescue organization. There are
              many loving animals in need of a home <HeartFilled />
              <HeartFilled />
              <HeartFilled />
            </Text>
            <Text mb={4}>
              We are currently in beta/test mode and for the next 3-6 months,
              the platform is free of any charge.
            </Text>
            <Text mb={5}>
              By using{" "}
              <Link color="teal" href="https://pawtner.ca" target="blank">
                pawtner.ca
              </Link>{" "}
              you agree to accept our{" "}
              <Link color="teal" href="/terms-and-conditions" target="blank">
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link color="teal" href="/privacy-policy" target="blank">
                Privacy Policy
              </Link>
              .
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Hide below="md">
        <Wrap justify={{ base: "left", md: "right" }} h={headerHeights}>
          <Center h={headerHeights} px="30px">
            {isAccountPage ? (
              <Circle
                bg="white"
                border="0 !important"
                w="49px"
                h="49px"
                cursor="pointer"
                onClick={onOpen}
              >
                {!!unreadMessageCount && (
                  <Circle
                    bg="#FEE8A0"
                    position="absolute"
                    ml="30px"
                    top="15px"
                    px={1}
                    w="26px"
                    h="26px"
                    filter="drop-shadow(0px 6px 8px rgba(135, 67, 223, 0.37))"
                  >
                    <Text fontSize={14} fontWeight={600}>
                      {unreadMessageCount}
                    </Text>
                  </Circle>
                )}
                <BellIcon h="28px" w="28px" />
              </Circle>
            ) : (
              <>
                <Link href="/dogs" fontWeight={600}>
                  Puppies for Sale
                </Link>
                <Box display="flex" ml="2rem">
                  <FavoriteIcon
                    cursor="pointer"
                    onClick={() => navigate("/favorites")}
                  />
                </Box>
              </>
            )}
          </Center>
        </Wrap>
        <Wrap>
          <Center
            h={headerHeights}
            borderLeft={isAccountPage ? 0 : "1px"}
            borderColor="gray.200"
          >
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
                  <MenuItem onClick={onOpen}>My Messages</MenuItem>
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
