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
  Divider,
  Flex,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
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
import Seo from "../../components/seo";
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
  const [roles, setRoles] = useState([]);
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

  const viewProfile = async (user, _roles) => {
    onOpen();
    setIsLoadingViewProfile(true);
    await fetchPuppyList(user.user_id);
    setProfile(user);
    setRoles(_roles);
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

  const renderUserField = (key) => {
    const value = profile.user_metadata[key];
    const label = key.replace("_", " ");
    return (
      <Flex>
        <Text key={key} w="20% !important">
          {label.charAt(0).toUpperCase() + label.slice(1)}
        </Text>
        <Text whiteSpace="pre-wrap" w="80% !important">
          {key === "profile_picture" ? (
            <a
              href={value}
              target="_blank"
              style={{ color: "blue" }}
              rel="noreferrer"
            >
              Link
            </a>
          ) : key === "breeder_verified" ? (
            value ? (
              "Yes"
            ) : (
              "No"
            )
          ) : (
            value
          )}
        </Text>
      </Flex>
    );
  };

  const renderPuppyList = () => {
    return (
      <SimpleGrid columns={3} spacing={10}>
        {puppyList.map((puppy) => (
          <Box key={puppy.id}>
            <img
              src={puppy.picture?.url || "/default-puppy-img.jpg"}
              alt={puppy.name}
              style={{
                width: "100%",
                maxHeight: "185px",
                objectFit: "contain",
              }}
            />
            <Text fontWeight={600} mt={2}>
              {puppy.name} - {puppy.breed}
            </Text>
            <Text>
              ${puppy.price}, {puppy.gender}, {puppy.color}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    );
  };

  return (
    <ChakraProvider theme={theme}>
      <Toast description={errorAlert} status="error" setAlert={setErrorAlert} />
      <Toast
        description={successAlert}
        status="success"
        setAlert={setSuccessAlert}
      />
      <Header authorizedRole="admin" bg="#F2F2F2" />
      <Box
        w="100%"
        h="100vh"
        px="2rem"
        bg="#F2F2F2"
        fontFamily="Poppins !important"
      >
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
                  <Th>Email Verified</Th>
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
                        {user.email_verified ? (
                          <CheckCircleTwoTone
                            style={{ fontSize: "20px" }}
                            twoToneColor="#52c41a"
                          />
                        ) : (
                          <CloseCircleTwoTone
                            style={{ fontSize: "20px" }}
                            twoToneColor="#ff4d4d"
                          />
                        )}
                      </Td>
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
                            viewProfile(user, roles);
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
          <ModalHeader>Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody px="3rem">
            {isLoadingViewProfile ? (
              <CustomSpinner />
            ) : (
              <>
                <Text fontWeight={600}>User Data</Text>
                <Divider my={2} />
                {!isEmpty(profile.user_metadata) &&
                  profile.user_metadata.first_name && (
                    <>
                      {renderUserField("first_name")}
                      {renderUserField("last_name")}
                      {renderUserField("email")}
                      {renderUserField("phone")}
                      {renderUserField("profile_picture")}
                      {renderUserField("address")}
                      {renderUserField("city")}
                      {renderUserField("country")}
                      {renderUserField("about_me")}
                      {renderUserField("breeder_verified")}
                      {renderUserField("followers")}
                      {renderUserField("following")}
                    </>
                  )}
                {isEmpty(profile.user_metadata) && "Profile is not set."}

                {roles.includes("breeder") && (
                  <>
                    <Text fontWeight={600} mt={5}>
                      Puppy List
                    </Text>
                    <Divider my={2} />
                    {puppyList.length && !isLoadingViewProfile ? (
                      renderPuppyList()
                    ) : (
                      <Text>No puppy listed.</Text>
                    )}
                  </>
                )}
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

export const Head = () => <Seo title="Admin" />;

export default withAuthenticationRequired(AdminPage);
