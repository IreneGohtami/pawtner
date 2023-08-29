import axios from "axios";
import { db } from "../../firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import {
  ChakraProvider,
  Box,
  Button,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

import theme from "../../theme";
import Header from "../../components/header";
import CustomSpinner from "../../components/spinner";
import Toast from "../../components/toast";
import { tableRow } from "./admin.module.css";

const AdminPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userList, setUserList] = useState([]);
  const [successAlert, setSuccessAlert] = useState(null);
  const [errorAlert, setErrorAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [profile, setProfile] = useState({});
  const [puppyList, setPuppyList] = useState([]);
  const [isLoadingViewProfile, setIsLoadingViewProfile] = useState(false);

  useEffect(() => {
    async function fetchAllUsers() {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`/api/auth0?action=get_all_users`);

        setUserList(data);
        setErrorAlert(null);
      } catch (error) {
        setErrorAlert(error?.response?.data || error.message);
      }
      setIsLoading(false);
    }
    fetchAllUsers();
  }, [successAlert]);

  const viewProfile = async (user) => {
    onOpen();
    setIsLoadingViewProfile(true);
    await fetchPuppyList(user.user_id);
    setProfile(user);
    setIsLoadingViewProfile(false);
  };

  const fetchPuppyList = async (userId) => {
    try {
      const q = query(
        collection(db, "puppy"),
        where("owner_id", "==", userId),
        orderBy("created_at", "asc")
      );
      const querySnapshot = await getDocs(q);

      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ ...doc.data(), id: doc.id });
      });
      setPuppyList(data);
    } catch (error) {
      setErrorAlert("Failed to fetch puppy list. Please try again.");
    }
  };

  const verifyBreeder = (flag) => {
    setIsVerifying(true);
    setTimeout(async () => {
      try {
        await axios.post("/api/auth0", {
          action: "update_user_metadata",
          userId: profile.user_id,
          connection: !isEmpty(profile.identities)
            ? profile.identities[0].connection
            : null,
          payload: {
            user_metadata: { breeder_verified: flag },
          },
        });
        setSuccessAlert(
          `Breeder has been ${flag ? "verified" : "unverified"} successfully.`
        );
        closeModal();
      } catch (error) {
        setErrorAlert("Failed to verify breeder. Please try again.");
      }
      setIsVerifying(false);
    }, 300);
  };

  const closeModal = () => {
    onClose();
    setProfile({});
    setPuppyList([]);
  };

  return (
    <ChakraProvider theme={theme}>
      <Toast description={errorAlert} status="error" setAlert={setErrorAlert} />
      <Toast
        description={successAlert}
        status="success"
        setAlert={setSuccessAlert}
      />
      <Box
        w="100%"
        h="100vh"
        px="2rem"
        bg="#F2F2F2"
        fontFamily="Poppins !important"
      >
        <Header authorizedRole="admin" />

        <Text fontSize={28} fontWeight={600} p="15px">
          Admin Panel
        </Text>

        {isLoading ? (
          <CustomSpinner />
        ) : (
          <TableContainer bg="white" mx="15px">
            <Table variant="simple">
              <TableCaption>List of all users</TableCaption>
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Breeder Verified</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody className={tableRow}>
                {userList.map((user) => {
                  const roles = !isEmpty(user.app_metadata)
                    ? user.app_metadata.roles
                    : [];
                  return (
                    <Tr key={user.user_id}>
                      <Td>
                        {!isEmpty(user.user_metadata) &&
                        user.user_metadata.first_name
                          ? (
                              user.user_metadata.first_name +
                              " " +
                              user.user_metadata.last_name
                            ).trim()
                          : user.name}
                      </Td>
                      <Td>{user.email}</Td>
                      <Td>{roles.length ? roles.join(", ") : "-"}</Td>
                      <Td>
                        {roles.includes("breeder") ? (
                          user.user_metadata?.breeder_verified ? (
                            <CheckCircleTwoTone
                              style={{ fontSize: "20px" }}
                              twoToneColor="#52c41a"
                            />
                          ) : (
                            <CloseCircleTwoTone
                              style={{ fontSize: "20px" }}
                              twoToneColor="#ff4d4d"
                            />
                          )
                        ) : (
                          "-"
                        )}
                      </Td>
                      <Td>
                        <Link
                          mr={3}
                          onClick={() => {
                            viewProfile(user);
                          }}
                        >
                          view
                        </Link>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Modal
        size="5xl"
        isOpen={isOpen}
        onClose={closeModal}
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Breeder Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isLoadingViewProfile ? (
              <CustomSpinner />
            ) : (
              <>
                <Text fontWeight={600}>User Data</Text>
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {!isEmpty(profile.user_metadata) ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: JSON.stringify(
                          profile.user_metadata,
                          null,
                          3
                        ).replace(
                          /("profile_picture": ")([^"]+)(")/g,
                          (match, p1, pictureUrl, p3) =>
                            `${p1}${
                              pictureUrl
                                ? `<a href="${pictureUrl}" style="color: blue" target="_blank">${pictureUrl}</a>`
                                : ""
                            }${p3}`
                        ),
                      }}
                    />
                  ) : (
                    "Profile is not set."
                  )}
                </pre>
                <br />
                <Text fontWeight={600}>Puppy List</Text>
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {puppyList.length && !isLoadingViewProfile ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: JSON.stringify(puppyList, null, 3).replace(
                          /("url": ")([^"]+)(")/g,
                          (match, p1, pictureUrl, p3) =>
                            `${p1}${
                              pictureUrl
                                ? `<a href="${pictureUrl}" style="color: blue" target="_blank">${pictureUrl}</a>`
                                : ""
                            }${p3}`
                        ),
                      }}
                    />
                  ) : (
                    "No puppy listed."
                  )}
                </pre>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={closeModal}>
              Close
            </Button>
            {!isEmpty(profile.app_metadata) &&
              profile.app_metadata.roles.includes("breeder") && (
                <Button
                  bg={theme.colors.primary}
                  colorScheme="yellow"
                  onClick={() =>
                    verifyBreeder(
                      profile.user_metadata?.breeder_verified ? false : true
                    )
                  }
                  isLoading={isVerifying}
                >
                  {profile.user_metadata?.breeder_verified
                    ? "Unverify Breeder"
                    : "Verify Breeder"}
                </Button>
              )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
};

export default withAuthenticationRequired(AdminPage);
