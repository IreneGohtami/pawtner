import axios from "axios";
import {
  getDownloadURL,
  ref,
  updateMetadata,
  uploadBytes,
} from "firebase/storage";
import { Field, Form, Formik } from "formik";
import { navigate } from "gatsby";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import { isEmpty } from "lodash";
import React, { useEffect, useRef, useState } from "react";

import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  ChakraProvider,
  Box,
  Button,
  Center,
  Circle,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Icon,
  Image,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  Spacer,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import { getCookie } from "../../cookie-manager";
import Header from "../../components/header";
import Seo from "../../components/seo";
import CustomSpinner from "../../components/spinner";
import { db, storage } from "../../firebase";
import theme from "../../theme";

import CameraIcon from "../../images/icons/camera.inline.svg";
import EmailIcon from "../../images/icons/email.inline.svg";
import TelephoneIcon from "../../images/icons/telephone.inline.svg";

import ListPuppyTable from "./list-puppy";
import UploadPuppyPage from "./upload-puppy";

import {
  cancelButton,
  followerBox,
  imgCircle,
  profileIcon,
  textarea,
} from "./breeder-profile.module.css";

const BreederProfile = () => {
  const { isAuthenticated, isLoading, user } = useAuth0();

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

  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [originalMetadata, setOriginalMetadata] = useState(defaultMetadata); // from API
  const [userMetadata, setUserMetadata] = useState(defaultMetadata);
  const [connection, setConnection] = useState("");
  const [isFormLoading, setIsFormLoading] = useState(true);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [onPictureHover, setOnPictureHover] = useState(false);
  const [errorAlert, setErrorAlert] = useState(null);
  const [successAlert, setSuccessAlert] = useState(null);
  const [modalAction, setModalAction] = useState("add");
  const [modalData, setModalData] = useState({});

  const fileInputRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    if (isAuthenticated && user) {
      const roles = user?.["https://pawtner.gatsbyjs.io/roles"] || [];
      if (!roles.length) {
        // Try to check cookie
        roles[0] = getCookie(`role|${user.email}`) || "";
      }
      console.log(user, roles, "user");
      setRole(roles[0] || "");

      if (roles[0] !== "breeder") {
        navigate("/");
        return;
      }

      const names = user.name.split(" ");
      const firstName = names.slice(0, -1).join(" ");
      const lastName = names.length > 1 ? names[names.length - 1] : "";

      async function fetchUserMetadata() {
        try {
          const { data } = await axios.get(
            `/api/auth0?action=get_user_metadata&userId=${user.sub}`
          );
          setUserMetadata(
            !isEmpty(data.user_metadata)
              ? { ...data.user_metadata, password: "", retype_password: "" }
              : {
                  ...defaultMetadata,
                  first_name: firstName,
                  last_name: lastName,
                  email: user.email,
                  profile_picture: user.picture || "",
                }
          );
          setOriginalMetadata(userMetadata);
          setConnection(data.identities[0].connection);
          setErrorAlert(null);
        } catch (error) {
          setErrorAlert(error?.response?.data || error.message);
        }
        setIsFormLoading(false);
      }
      fetchUserMetadata();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (successAlert) {
      toast({
        description: successAlert,
        status: "success",
        duration: 8000,
        isClosable: true,
        position: "top-right",
      });
      setSuccessAlert(null);
    }
  }, [successAlert]);

  useEffect(() => {
    if (errorAlert) {
      toast({
        description: errorAlert,
        status: "error",
        duration: 8000,
        isClosable: true,
        position: "top-right",
      });
      setErrorAlert(null);
    }
  }, [errorAlert]);

  const renderSectionTitle = (title) => {
    return isLoading ? (
      <CustomSpinner height="100vh" />
    ) : (
      <Flex my={5}>
        <Text fontSize={18} fontWeight={600}>
          {title}
        </Text>
        <Spacer />
        <Divider w={{ base: "85%", lg: "88%" }} alignSelf="center" />
      </Flex>
    );
  };

  const renderInput = (
    name,
    label,
    type,
    placeholder = "",
    additionalProps = {}
  ) => {
    return (
      <Field name={name}>
        {({ field, form }) => (
          <FormControl
            isInvalid={form.errors[name] && form.touched[name]}
            mb={5}
          >
            <FormLabel>{label}</FormLabel>
            <Input
              {...field}
              type={type}
              focusBorderColor={theme.colors.primary}
              variant="flushed"
              placeholder={placeholder || label}
              onChange={(e) => {
                setUserMetadata({ ...userMetadata, [name]: e.target.value });
              }}
              {...additionalProps}
            />
            <FormErrorMessage>{form.errors[name]}</FormErrorMessage>
          </FormControl>
        )}
      </Field>
    );
  };

  const updateUserMetadata = async (values, actions) => {
    try {
      if (JSON.stringify(userMetadata) === JSON.stringify(originalMetadata)) {
        // No need to update if there are no changes
        return;
      }
      await axios.post("/api/auth0", {
        action: "update_user_metadata",
        userId: user.sub,
        connection,
        payload: {
          user_metadata: values,
        },
      });
      setOriginalMetadata(userMetadata);
      setErrorAlert(null);
    } catch (e) {
      setErrorAlert(e?.response?.data || e.message);
    }
    actions.setSubmitting(false);
  };

  const updateUserProfilePicture = async (imageUrl) => {
    try {
      await axios.post("/api/auth0", {
        action: "update_user_metadata",
        userId: user.sub,
        connection,
        payload: {
          user_metadata: {
            profile_picture: imageUrl,
          },
        },
      });
      setUserMetadata({ ...userMetadata, profile_picture: imageUrl });
      setOriginalMetadata(userMetadata);
      setErrorAlert(null);
    } catch (e) {
      setErrorAlert(e?.response?.data || e.message);
    }
    setIsUploadingPicture(false);
  };

  const validatePassword = (value) => {
    if (!value) {
      return "";
    }
    setPassword(value);

    if (value.length < 8) {
      return "Password must contain at least 8 characters";
    }
    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least 1 uppercase letter";
    }
    if (!/[a-z]/.test(value)) {
      return "Password must contain at least 1 lowercase letter";
    }
    if (!/\d/.test(value)) {
      return "Password must contain at least 1 number";
    }
    /*if (!/[!@#$%^&*]/.test(value)) {
      return "Password must contain at least 1 special character";
    }*/
    return "";
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const validateImage = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      setErrorAlert("You can only upload JPG/PNG file");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      setErrorAlert("Image must be smaller than 2MB");
    }
    return isJpgOrPng && isLt2M;
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!validateImage(file)) {
        return;
      }
      setIsUploadingPicture(true);
      const userId = user ? user.sub.split("|")[1] : "";
      const storageRef = ref(storage, `users/${userId}/profile_picture.png`);

      try {
        await updateMetadata(storageRef, {
          customMetadata: {
            userId: userId,
          },
        });
        const snapshot = await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(snapshot.ref);

        await updateUserProfilePicture(imageUrl);
        setErrorAlert(null);
      } catch (error) {
        setErrorAlert("Error uploading image. Please try again.");
        console.log("Error uploading image:", error);
        setIsUploadingPicture(false);
      }
    }
  };

  countries.registerLocale(en);
  const countryObj = countries.getNames("en", { select: "official" });
  const countryArr = Object.entries(countryObj).map(([key, value]) => {
    return {
      label: value,
      value: key,
    };
  });

  return (
    !isFormLoading && (
      <ChakraProvider theme={theme}>
        <Box
          w="100%"
          px="1.5rem"
          pb="5rem"
          bg="#F2F2F2"
          fontFamily="Poppins !important"
        >
          <Header isAuthenticated={isAuthenticated} user={user} role={role} />

          <Accordion defaultIndex={[0, 1]} allowMultiple>
            <AccordionItem>
              <AccordionButton>
                <AccordionIcon fontSize={30} />
                <Text fontSize={28} fontWeight={600}>
                  &emsp;Breeder Profile
                </Text>
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Formik
                  initialValues={userMetadata}
                  enableReinitialize
                  onSubmit={async (values, actions) => {
                    await updateUserMetadata(values, actions);
                  }}
                >
                  {({ isSubmitting, errors, touched }) => (
                    <Form>
                      <Flex
                        gap="30px"
                        direction={{ base: "column", lg: "row" }}
                      >
                        <Box flex={4} bg="white" borderRadius={20} p="25px">
                          <Flex
                            px="15px"
                            py="8px"
                            direction={{ base: "column", lg: "row" }}
                          >
                            <HStack>
                              <Text
                                fontSize={16}
                                fontWeight={800}
                                color={theme.colors.primary}
                              >
                                Profile /
                              </Text>
                              <Text fontSize={16} color="gray.500">
                                Edit Profile
                              </Text>
                            </HStack>
                            <Spacer />
                            <HStack>
                              <Button className={cancelButton}>Cancel</Button>
                              <Button
                                bg={theme.colors.primary}
                                colorScheme="yellow"
                                size="md"
                                borderRadius={54}
                                isLoading={isSubmitting}
                                type="submit"
                              >
                                Save Changes
                              </Button>
                            </HStack>
                          </Flex>

                          {renderSectionTitle("GENERALS")}
                          <Stack
                            direction={{ md: "row" }}
                            spacing={{ base: 3, md: 10 }}
                            flexWrap={{ base: "wrap", md: "nowrap" }}
                          >
                            {renderInput(
                              "first_name",
                              "First name",
                              "text",
                              "",
                              {
                                required: true,
                              }
                            )}
                            {renderInput("last_name", "Last name", "text", "", {
                              required: true,
                            })}
                            {renderInput("email", "Email", "email", "", {
                              disabled: true,
                            })}
                          </Stack>
                          <Stack
                            direction={{ base: "column", md: "row" }}
                            spacing={{ base: 3, md: 10 }}
                          >
                            <FormControl
                              isInvalid={!!errors.password && touched.password}
                              mb={5}
                            >
                              <FormLabel>Password</FormLabel>
                              <Field
                                as={Input}
                                name="password"
                                type="password"
                                focusBorderColor={theme.colors.primary}
                                variant="flushed"
                                placeholder="***************"
                                validate={(value) => {
                                  return validatePassword(value);
                                }}
                                onChange={(e) => {
                                  setUserMetadata({
                                    ...userMetadata,
                                    password: e.target.value,
                                  });
                                }}
                              />
                              <FormErrorMessage>
                                {errors.password}
                              </FormErrorMessage>
                            </FormControl>

                            <FormControl
                              isInvalid={
                                !!errors.retype_password &&
                                touched.retype_password
                              }
                              mb={5}
                            >
                              <FormLabel>Re-Type Password</FormLabel>
                              <Field
                                as={Input}
                                name="retype_password"
                                type="password"
                                focusBorderColor={theme.colors.primary}
                                variant="flushed"
                                placeholder="***************"
                                validate={(value) => {
                                  if (value !== password) {
                                    return "Password does not match";
                                  }
                                }}
                              />
                              <FormErrorMessage>
                                {errors.retype_password}
                              </FormErrorMessage>
                            </FormControl>

                            {renderInput(
                              "phone",
                              "Phone Number",
                              "tel",
                              "+5012345678"
                            )}
                          </Stack>

                          {renderSectionTitle("ADDRESS")}
                          <Stack
                            direction={{ md: "row" }}
                            spacing={{ base: 3, md: 10 }}
                            flexWrap={{ base: "wrap", md: "nowrap" }}
                          >
                            {renderInput(
                              "address",
                              "Address",
                              "text",
                              "Street name, house number"
                            )}

                            {renderInput("city", "City", "text")}

                            <FormControl>
                              <FormLabel>Country</FormLabel>
                              <Select
                                name="country"
                                focusBorderColor={theme.colors.primary}
                                variant="flushed"
                                placeholder=""
                                value={userMetadata.country || "CA"}
                                onChange={(e) => {
                                  setUserMetadata({
                                    ...userMetadata,
                                    country: e.target.value,
                                  });
                                }}
                              >
                                {countryArr.map(({ label, value }) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>
                          </Stack>

                          {renderSectionTitle("ABOUT ME")}
                          <Textarea
                            name="about_me"
                            className={textarea}
                            focusBorderColor={theme.colors.primary}
                            placeholder="Write something about yourself"
                            value={userMetadata.about_me || ""}
                            onChange={(e) => {
                              setUserMetadata({
                                ...userMetadata,
                                about_me: e.target.value,
                              });
                            }}
                          />
                        </Box>

                        <Box
                          flex={1}
                          bg="white"
                          borderRadius={20}
                          p="25px"
                          display="flex"
                          justifyContent="center"
                          //h="550px"
                        >
                          <VStack>
                            {isUploadingPicture ? (
                              <CustomSpinner />
                            ) : (
                              <Image
                                src={userMetadata.profile_picture}
                                className={imgCircle}
                                alt="profile picture"
                                maxW="152px"
                                maxH="152px"
                                border={`6px solid ${theme.colors.primary}`}
                                opacity={onPictureHover ? 0.4 : 1}
                                onClick={handleUploadClick}
                                onMouseEnter={() => setOnPictureHover(true)}
                                onMouseLeave={() => setOnPictureHover(false)}
                              />
                            )}
                            {onPictureHover && (
                              <Icon
                                as={CameraIcon}
                                boxSize="30px"
                                cursor="pointer"
                                position="absolute"
                                mt="50px"
                                onClick={handleUploadClick}
                              />
                            )}
                            <Input
                              type="file"
                              name="profile_picture"
                              ref={fileInputRef}
                              onChange={handleUploadImage}
                              accept="image/*"
                              opacity={0}
                              h={0}
                            />

                            <Text fontSize={22} fontWeight={500}>
                              {`${userMetadata.first_name} ${userMetadata.last_name}`}
                            </Text>
                            <Text>Breeder</Text>
                            {/*<Text>Verified By USA</Text>*/}

                            <HStack mt={2}>
                              <Center className={followerBox}>
                                <VStack>
                                  <Text fontSize={22} fontWeight={600}>
                                    {userMetadata.following || 0}
                                  </Text>
                                  <Text>Following</Text>
                                </VStack>
                              </Center>
                              <Center className={followerBox}>
                                <VStack>
                                  <Text fontSize={22} fontWeight={600}>
                                    {userMetadata.followers || 0}
                                  </Text>
                                  <Text>Followers</Text>
                                </VStack>
                              </Center>
                            </HStack>

                            <Divider my={5} />

                            {userMetadata.phone && (
                              <HStack w="100%" textAlign="left">
                                <Circle className={profileIcon}>
                                  <Icon as={TelephoneIcon} boxSize="24px" />
                                </Circle>
                                <Text>{userMetadata.phone}</Text>
                              </HStack>
                            )}
                            <HStack w="100%" textAlign="left">
                              <Circle className={profileIcon}>
                                <Icon as={EmailIcon} boxSize="24px" />
                              </Circle>
                              <Text>{userMetadata.email}</Text>
                            </HStack>

                            {/*<Text fontSize={22} fontWeight={500} mt={5}>
                                Breeder Performance
                              </Text>*/}
                          </VStack>
                        </Box>
                      </Flex>
                    </Form>
                  )}
                </Formik>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionButton>
                <AccordionIcon fontSize={30} />
                <Text fontSize={28} fontWeight={600}>
                  &emsp;My Puppies
                </Text>
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Box bg="white" borderRadius={20} p="25px">
                  <Flex mb={3}>
                    <Spacer />
                    <Button
                      bg={theme.colors.primary}
                      colorScheme="yellow"
                      size="md"
                      borderRadius={54}
                      onClick={() => {
                        setModalAction("add");
                        setModalData({});
                        onOpen();
                      }}
                    >
                      Add Puppy
                    </Button>
                  </Flex>

                  <ListPuppyTable
                    userId={user.sub}
                    db={db}
                    storage={storage}
                    refreshTable={successAlert}
                    openModal={onOpen}
                    setModalAction={setModalAction}
                    setModalData={setModalData}
                    setSuccessAlert={setSuccessAlert}
                    setErrorAlert={setErrorAlert}
                  />

                  <UploadPuppyPage
                    userId={user.sub}
                    isOpen={isOpen}
                    onClose={onClose}
                    setSuccessAlert={setSuccessAlert}
                    db={db}
                    storage={storage}
                    action={modalAction}
                    puppyData={modalData}
                  />
                </Box>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>
      </ChakraProvider>
    )
  );
};

export const Head = () => <Seo title="Breeder Profile" />;

export default withAuthenticationRequired(BreederProfile);
