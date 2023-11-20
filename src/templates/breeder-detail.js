import axios from "axios";
import { graphql, navigate } from "gatsby";
import React, { useEffect, useState } from "react";
import {
  StarFilled,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";
import {
  Box,
  Button,
  ChakraProvider,
  Flex,
  Hide,
  Icon,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Spacer,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";

import ChatPage from "../components/chat";
import Header from "../components/header";
import Footer from "../components/footer";
import Seo from "../components/seo";
import CustomSpinner from "../components/spinner";
import Toast from "../components/toast";
import LocationIcon from "../images/icons/location.inline.svg";
import theme from "../theme";

const BreedersPage = ({ pageContext, data }) => {
  const userId = pageContext.id;
  const puppyList = data?.allPuppy?.nodes || [];
  const defaultMetadata = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    retype_password: "",
    address: "",
    city: "",
    country: "",
    about_me: "",
    profile_picture: "",
    following: 0,
    followers: 0,
    documents: [],
  };

  const [breederInfo, setBreederInfo] = useState(defaultMetadata);
  const [isLoading, setIsLoading] = useState(true);
  const [errorAlert, setErrorAlert] = useState(null);
  const [viewImageUrl, setViewImageUrl] = useState(null);
  const [displayChat, setDisplayChat] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    async function fetchBreederInfo() {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          `/api/auth0?action=get_user_metadata&userId=${userId}`
        );
        setBreederInfo(data?.user_metadata || defaultMetadata);
        setErrorAlert(null);
      } catch (error) {
        setErrorAlert(error?.response?.data || error.message);
      }
      setIsLoading(false);
    }
    fetchBreederInfo();
  }, []);

  const viewImage = (url) => {
    setViewImageUrl(url);
    onOpen();
  };

  return (
    <ChakraProvider theme={theme}>
      {/* Enlarge image modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton bg="rgba(255, 255, 255, 0.9)" />
          <ModalBody pb={6} m={"0 auto"}>
            <Image src={viewImageUrl} alt="image" />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Chat modal */}
      <Modal
        isOpen={displayChat}
        onClose={() => setDisplayChat(false)}
        size="full"
      >
        <ModalContent>
          <ModalBody p={0}>
            <ChatPage
              breederId={userId.split("|").pop()}
              breederInfo={breederInfo}
              setDisplayChat={setDisplayChat}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Box bg="#F9F9F9" fontFamily="Poppins !important">
        <Toast
          description={errorAlert}
          status="error"
          setAlert={setErrorAlert}
        />
        <Header authorizedRole="all" bg="#F9F9F9" />
        <Flex px="4rem" py="20px" flexWrap="wrap">
          {isLoading ? (
            <CustomSpinner />
          ) : (
            <>
              <VStack flex="1" mr={5} mb={5}>
                <Box borderRadius={10} bg="white" w="100%">
                  <Image
                    src="/breeder-cover-photo.jpeg"
                    minW="100%"
                    h={150}
                    borderRadius={10}
                    objectFit="cover"
                    alt="cover photo"
                  />
                  <Flex flexWrap="wrap">
                    <Box px="30px" pb="20px" mt="-105px">
                      <Image
                        src={breederInfo.profile_picture}
                        alt="profile picture"
                        w="140px"
                        h="140px"
                        borderRadius="140px"
                        objectFit="cover"
                        mb={2}
                      />
                      <Text
                        fontSize={20}
                        fontWeight={500}
                      >{`${breederInfo.first_name} ${breederInfo.last_name}`}</Text>
                      <Text color="gray">
                        {breederInfo.breeder_verified ? (
                          <>
                            Breeder Verified by Admin{" "}
                            <CheckCircleTwoTone twoToneColor="#52c41a" />
                          </>
                        ) : (
                          <>
                            Breeder Not Verified{" "}
                            <CloseCircleTwoTone twoToneColor="red" />
                          </>
                        )}
                      </Text>
                      <Text opacity={0.6}>
                        <Icon as={LocationIcon} w="24px" h="24px" mb="-5px" />{" "}
                        {breederInfo.city
                          ? `${breederInfo.city}, ${breederInfo.country}`
                          : `${breederInfo.country} || Canada`}
                      </Text>
                    </Box>
                    <Hide below="xl">
                      <Spacer />
                    </Hide>
                    <Box px="30px" py="20px" mt={{ base: 0, lg: "60px" }}>
                      <Button bg="primary" colorScheme="yellow">
                        Book showing
                      </Button>
                      <Button bg="primary" colorScheme="yellow" mx={3}>
                        Application
                      </Button>
                      <Button
                        bg="primary"
                        colorScheme="yellow"
                        onClick={() => setDisplayChat(true)}
                      >
                        Connect
                      </Button>
                    </Box>
                  </Flex>
                </Box>
                <Box mt={5} bg="white" borderRadius={10} w="100%">
                  <Tabs colorScheme="customYellow">
                    <TabList mt={2}>
                      <Tab>Available puppies</Tab>
                      <Tab>Gallery</Tab>
                      <Tab>Documents</Tab>
                      <Tab>Review</Tab>
                      <Tab>About</Tab>
                    </TabList>

                    <TabPanels overflow="auto">
                      <TabPanel>
                        {puppyList.length > 0 && (
                          <Flex flexWrap="nowrap" maxW="800px">
                            {puppyList.map((puppy) => (
                              <Box
                                key={puppy.id}
                                minW="200px"
                                bg="#F9F9F9"
                                p="20px"
                                mb="10px"
                              >
                                <Image
                                  src={
                                    puppy?.picture?.url ||
                                    "/default-puppy-img.jpg"
                                  }
                                  alt="puppy"
                                  w="100%"
                                  h={150}
                                  borderRadius="6px"
                                  objectFit="cover"
                                  mb={2}
                                />
                                <Text
                                  fontSize={18}
                                  fontWeight={500}
                                  textAlign="center"
                                >
                                  {puppy.name}
                                </Text>
                                <Button
                                  bg="primary"
                                  w="100%"
                                  onClick={() => navigate(`/puppy/${puppy.id}`)}
                                >
                                  Apply
                                </Button>
                              </Box>
                            ))}
                          </Flex>
                        )}
                      </TabPanel>
                      <TabPanel>
                        <Flex minW="200px" bg="#F9F9F9" p="20px" mb="10px">
                          {puppyList.map(
                            (puppy) =>
                              puppy?.picture?.url && (
                                <Image
                                  key={puppy.picture.reference}
                                  src={puppy.picture.url}
                                  alt="puppy"
                                  h={150}
                                  borderRadius="6px"
                                  objectFit="contain"
                                  m={2}
                                  cursor="pointer"
                                  onClick={() => viewImage(puppy.picture.url)}
                                />
                              )
                          )}
                        </Flex>
                      </TabPanel>
                      <TabPanel>
                        <Flex minW="200px" bg="#F9F9F9" p="20px" mb="10px">
                          {puppyList.map((puppy) =>
                            puppy?.certificates?.map(
                              (certificate) =>
                                certificate.url && (
                                  <Image
                                    key={certificate.reference}
                                    src={certificate.url}
                                    alt="puppy certificate"
                                    h={150}
                                    borderRadius="6px"
                                    objectFit="contain"
                                    m={2}
                                    cursor="pointer"
                                    onClick={() => viewImage(certificate.url)}
                                  />
                                )
                            )
                          )}
                        </Flex>
                      </TabPanel>
                      <TabPanel>
                        <p>Coming soon!</p>
                      </TabPanel>
                      <TabPanel>
                        <Text>{breederInfo.about_me}</Text>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Box>
              </VStack>
              <VStack>
                <Box
                  w="450px"
                  bg="rgba(254, 232, 160, 0.19)"
                  borderRadius={10}
                  p="20px"
                  mb="10px"
                >
                  <Text fontSize={16} fontWeight={500}>
                    <StarFilled /> Certification
                  </Text>
                  <Flex mt={2}>
                    {breederInfo?.documents?.map((document) => (
                      <Image
                        key={document.reference}
                        src={document.url}
                        alt="breeder certificate"
                        h={150}
                        borderRadius="6px"
                        objectFit="contain"
                        m={2}
                        cursor="pointer"
                        onClick={() => viewImage(document.url)}
                      />
                    ))}
                    {!breederInfo?.documents?.length && (
                      <Text>No documents uploaded</Text>
                    )}
                  </Flex>
                </Box>
                <Box w="450px" bg="white" borderRadius={10} p="20px">
                  <Text fontSize={16} fontWeight={500}>
                    Experience
                  </Text>
                  <Box
                    borderRadius={10}
                    bg="rgba(254, 232, 160, 0.19)"
                    mt="15px"
                    py="10px"
                    px="20px"
                  >
                    <Text>{breederInfo.about_me}</Text>
                  </Box>
                </Box>
              </VStack>
            </>
          )}
        </Flex>
        <Footer currentPage="breeder" />
      </Box>
    </ChakraProvider>
  );
};

export const pageQuery = graphql`
  query ($id: String!) {
    allPuppy(filter: { owner_id: { eq: $id } }) {
      nodes {
        id
        name
        breed
        picture {
          url
          reference
        }
        certificates {
          url
          reference
        }
        owner_id
      }
    }
  }
`;

export const Head = () => <Seo title="Breeders" />;

export default BreedersPage;
