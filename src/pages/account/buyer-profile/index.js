import axios from "axios";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { Field, Form, Formik } from "formik";
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
  Link,
  Modal,
  ModalBody,
  ModalContent,
  Select,
  Stack,
  Text,
  Textarea,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";

import ChatPage from "../../../components/chat";
import Header from "../../../components/header";
import Seo from "../../../components/seo";
import CustomSpinner from "../../../components/spinner";
import Toast from "../../../components/toast";
import { storage } from "../../../firebase";
import theme from "../../../theme";

import CameraIcon from "../../../images/icons/camera.inline.svg";
import EmailIcon from "../../../images/icons/email.inline.svg";
import TelephoneIcon from "../../../images/icons/telephone.inline.svg";

import {
  cancelButton,
  followerBox,
  imgCircle,
  profileIcon,
  textarea,
} from "../breeder-profile/breeder-profile.module.css";

const BuyerProfile = () => {
  const { isLoading, user } = useAuth0();
  const fileInputRef = useRef(null);

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
    breeder_verified: false,
    following: 0,
    followers: 0,
    documents: [],
  };

  const [password, setPassword] = useState("");
  const [originalMetadata, setOriginalMetadata] = useState(defaultMetadata); // from API
  const [userMetadata, setUserMetadata] = useState(defaultMetadata);
  const [connection, setConnection] = useState("");
  const [isFormLoading, setIsFormLoading] = useState(true);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [onPictureHover, setOnPictureHover] = useState(false);
  const [errorAlert, setErrorAlert] = useState(null);
  const [successAlert, setSuccessAlert] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentUploadError, setDocumentUploadError] = useState(null);
  const [displayChat, setDisplayChat] = useState(false);

  useEffect(() => {
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
        setOriginalMetadata(data.user_metadata);
        setDocuments(data.user_metadata?.documents || []);
        setConnection(data.identities[0].connection);
        setErrorAlert(null);
      } catch (error) {
        setErrorAlert(error?.response?.data || error.message);
      }
      setIsFormLoading(false);
    }
    fetchUserMetadata();
  }, []);

  useEffect(() => {
    if (successAlert) {
      // Trigger a rebuild in gatsby via webhook
      axios.post(process.env.NETLIFY_BUILD_WEBHOOK);
    }
  }, [successAlert]);

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
      setSuccessAlert("Profile updated successfully.");
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

  const updateUserDocuments = async (documents) => {
    try {
      await axios.post("/api/auth0", {
        action: "update_user_metadata",
        userId: user.sub,
        connection,
        payload: {
          user_metadata: {
            documents,
          },
        },
      });
      setUserMetadata({ ...userMetadata, documents });
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

  const validateImage = (file, type = "profile") => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      const errMsg = "You can only upload JPG/PNG file";
      if (type === "profile") {
        setErrorAlert(errMsg);
      } else {
        setDocumentUploadError(errMsg);
      }
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      const errMsg = "Image must be smaller than 2MB";
      if (type === "profile") {
        setErrorAlert(errMsg);
      } else {
        setDocumentUploadError(errMsg);
      }
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

  const handleDocumentChange = async (event) => {
    const { file, fileList } = event;
    const { status } = file;
    const userId = user ? user.sub.split("|")[1] : "";

    if (status === "removed") {
      const newDocuments = documents.filter(
        (document) => document.uid !== file.uid
      );
      setDocuments(newDocuments);

      // delete from storage if exists in userMetadata.documents
      if (
        userMetadata.documents.find(
          (document) => document.reference === file.reference
        )
      ) {
        try {
          const storageRef = ref(
            storage,
            `users/${userId}/documents/certificates/${file.name}`
          );
          await deleteObject(storageRef);
        } catch (error) {
          console.log("Error deleting document:", error);
        }

        // update user.metadata.documents
        const newDocumentList = userMetadata.documents.filter(
          (document) => document.reference !== file.reference
        );
        await updateUserDocuments(newDocumentList);
      }
    } else if (file) {
      if (!status) {
        // no status means it failed validateImage validation
        fileList[fileList.length - 1].status = "error";
        fileList[fileList.length - 1].error = {};
        fileList[fileList.length - 1].error.message = documentUploadError;
      }

      setDocuments(fileList);
    }
  };

  const uploadDocument = async (event) => {
    const { file } = event;
    const userId = user ? user.sub.split("|")[1] : "";

    // upload directly to storage
    const storageRef = ref(
      storage,
      `users/${userId}/documents/certificates/${file.name}`
    );
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(snapshot.ref);

      // update user.metadata.documents
      await updateUserDocuments([
        ...userMetadata.documents,
        {
          reference: file.uid,
          name: snapshot.ref.name,
          url: imageUrl,
          status: "done",
        },
      ]);

      setDocumentUploadError(null);
    } catch (error) {
      setDocumentUploadError("Error uploading document. Please try again.");
    }

    documents[documents.length - 1].percent = 100;
    documents[documents.length - 1].status = "done";
    setDocuments(documents);
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
    <ChakraProvider theme={theme}>
      <Toast description={errorAlert} status="error" setAlert={setErrorAlert} />
      <Toast
        description={successAlert}
        status="success"
        setAlert={setSuccessAlert}
      />

      <Header authorizedRole="buyer" bg="#F2F2F2" />

      {/* Chat modal */}
      <Modal
        isOpen={displayChat}
        onClose={() => setDisplayChat(false)}
        size="full"
      >
        <ModalContent>
          <ModalBody p={0}>
            <ChatPage
              breederId={user?.sub.split("|").pop() || ""}
              breederInfo={userMetadata}
              setDisplayChat={setDisplayChat}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Box
        w="100%"
        px="1.5rem"
        pb="5rem"
        bg="#F2F2F2"
        fontFamily="Poppins !important"
      >
        {!isFormLoading && (
          <Accordion defaultIndex={[0, 1, 2]} allowMultiple>
            <AccordionItem>
              <AccordionButton>
                <AccordionIcon fontSize={30} />
                <Text fontSize={28} fontWeight={600}>
                  &emsp;Buyer Profile
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
                              "First Name",
                              "text",
                              "",
                              {
                                required: true,
                              }
                            )}
                            {renderInput("last_name", "Last Name", "text", "", {
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

                            {renderInput("phone", "Phone Number", "tel")}
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
                            <Text opacity={0.7}>Buyer</Text>

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
                            <HStack w="100%" textAlign="left">
                              <Circle className={profileIcon}>
                                <BellIcon h="28px" w="28px" color="#FEE8A0" />
                              </Circle>
                              <Link onClick={() => setDisplayChat(true)}>
                                View Messages
                              </Link>
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
          </Accordion>
        )}
      </Box>
    </ChakraProvider>
  );
};

export const Head = () => <Seo title="Breeder Profile" />;

export default withAuthenticationRequired(BuyerProfile);
