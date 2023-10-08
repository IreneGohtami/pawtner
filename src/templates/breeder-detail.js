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
  Icon,
  Image,
  Spacer,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Text,
  VStack,
} from "@chakra-ui/react";

import Header from "../components/header";
import Footer from "../components/footer";
import Seo from "../components/seo";
import Toast from "../components/toast";
import LocationIcon from "../images/icons/location.inline.svg";
import theme from "../theme";
import CustomSpinner from "../components/spinner";

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
  };

  const [breederInfo, setBreederInfo] = useState(defaultMetadata);
  const [isLoading, setIsLoading] = useState(true);
  const [errorAlert, setErrorAlert] = useState(null);

  useEffect(() => {
    async function fetchBreederInfo() {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          `/api/auth0?action=get_user_metadata&userId=${userId}`
        );
        console.log(data.user_metadata);
        setBreederInfo(data?.user_metadata || defaultMetadata);
        setErrorAlert(null);
      } catch (error) {
        setErrorAlert(error?.response?.data || error.message);
      }
      setIsLoading(false);
    }
    fetchBreederInfo();
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <Box bg="#F9F9F9" fontFamily="Poppins !important">
        <Toast
          description={errorAlert}
          status="error"
          setAlert={setErrorAlert}
        />
        <Header authorizedRole="all" bg="#F9F9F9" />
        <Flex px="4rem" py="20px">
          {isLoading ? (
            <CustomSpinner />
          ) : (
            <>
              <VStack flex="1" mr={5}>
                <Box borderRadius={10} bg="white" w="100%">
                  <Image
                    src="/breeder-cover-photo.jpeg"
                    h={150}
                    borderRadius={10}
                    objectFit="cover"
                    alt="cover photo"
                  />
                  <Flex>
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
                    <Spacer />
                    <Box px="30px" py="20px" mt="60px">
                      <Button bg="primary" colorScheme="yellow">
                        Book showing
                      </Button>
                      <Button bg="primary" colorScheme="yellow" mx={3}>
                        Application
                      </Button>
                      <Button bg="primary" colorScheme="yellow">
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
                          <Flex flexWrap="nowrap">
                            {puppyList.map((puppy) => (
                              <Box
                                key={puppy.id}
                                w="30%"
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
                        <p>Coming soon!</p>
                      </TabPanel>
                      <TabPanel>
                        <p>Coming soon!</p>
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
              <VStack pl="20px">
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
                  <Text fontSize={18}>upload here</Text>
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
                    <Text fontSize={14}>{breederInfo.about_me}</Text>
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
        owner_id
      }
    }
  }
`;

export const Head = () => <Seo title="Breeders" />;

export default BreedersPage;
