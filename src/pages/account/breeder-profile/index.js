import axios from "axios";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Field, Form, Formik } from "formik";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import isEmpty from "lodash/isEmpty";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";

import { Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  Stack,
  Text,
  Textarea,
  Tooltip,
  Spacer,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";

import Header from "../../../components/header";
import Seo from "../../../components/seo";
import CustomSpinner from "../../../components/spinner";
import Toast from "../../../components/toast";
import { db, storage } from "../../../firebase";
import theme from "../../../theme";

import CameraIcon from "../../../images/icons/camera.inline.svg";
import EmailIcon from "../../../images/icons/email.inline.svg";
import TelephoneIcon from "../../../images/icons/telephone.inline.svg";

import ListPaymentTable from "./list-payment";
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
  const { isLoading, user } = useAuth0();
  const { isOpen, onOpen, onClose } = useDisclosure();
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
  const [modalAction, setModalAction] = useState("add");
  const [modalData, setModalData] = useState({});
  const [documents, setDocuments] = useState([]);
  const [documentUploadError, setDocumentUploadError] = useState(null);
  const [reservedPuppies, setReservedPuppies] = useState([]);
  const [viewReservedPuppy, setViewReservedPuppy] = useState(false);
  const [isLoadingReservedPuppy, setIsLoadingReservedPuppy] = useState(false);
  const [reservedPuppyPayment, setReservedPuppyPayment] = useState(null);
  const [isRefunding, setIsRefunding] = useState(false);

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
          data?.user_metadata?.first_name
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
        setErrorAlert(error?.response?.data?.error || error.message);
      }
      setIsFormLoading(false);
    }

    async function fetchPuppyReserved() {
      try {
        const q = query(
          collection(db, "puppy"),
          where("owner_id", "==", user.sub),
          where("status", "==", "Reserved")
        );

        const querySnapshot = await getDocs(q);
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ ...doc.data(), id: doc.id });
        });

        setReservedPuppies(data);
        setErrorAlert(null);
      } catch (error) {
        setErrorAlert(error?.response?.data?.error || error.message);
      }
    }
    fetchUserMetadata();
    fetchPuppyReserved();
  }, []);

  useEffect(() => {
    if (successAlert) {
      console.log(process.env.NETLIFY_BUILD_WEBHOOK, "NETLIFY_BUILD_WEBHOOK");
      // Trigger a rebuild in gatsby via webhook
      axios.post(
        "https://api.netlify.com/build_hooks/651fb383e5a0286be4d8386d"
      );
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

  const viewReservedPuppyDetail = async (puppyId) => {
    setIsLoadingReservedPuppy(true);
    setViewReservedPuppy(true);
    try {
      const q = query(
        collection(db, "payment"),
        where("animal_id", "==", puppyId),
        where("type", "==", "reservation")
      );

      const querySnapshot = await getDocs(q);
      let tempData = null;
      if (!querySnapshot.empty) {
        tempData = {
          ...querySnapshot.docs[0].data(),
          id: querySnapshot.docs[0].id,
        };
      }

      if (tempData) {
        const buyerInfo = await fetchBuyerInfo(tempData.user_id);
        setReservedPuppyPayment({
          ...tempData,
          buyer: buyerInfo,
        });
      }

      setErrorAlert(null);
    } catch (error) {
      setErrorAlert(
        "Failed to retrieve reserved puppy payment details. Please try again."
      );
    }
    setIsLoadingReservedPuppy(false);
  };

  const renderPuppyPayment = () => {
    if (!reservedPuppyPayment) {
      return <Text>No payment record found for this puppy.</Text>;
    }
    return (
      <VStack spacing={5} alignItems="flex-start">
        <HStack>
          <Text fontWeight={600}>Buyer:</Text>
          <Text>
            {reservedPuppyPayment.buyer.name} (
            {reservedPuppyPayment.buyer.email})
          </Text>
        </HStack>
        <HStack>
          <Text fontWeight={600}>Payment Status:</Text>
          <Text>{reservedPuppyPayment.payment_status}</Text>
        </HStack>
        <HStack>
          <Text fontWeight={600}>Amount:</Text>
          <Text>
            {reservedPuppyPayment.currency.toUpperCase()}{" "}
            {reservedPuppyPayment.amount.toLocaleString()}
          </Text>
        </HStack>
        <HStack>
          <Text fontWeight={600}>Date:</Text>
          <Text>
            {moment
              .unix(reservedPuppyPayment.created)
              .format("YYYY-MM-DD HH:mm:ss")}
          </Text>
        </HStack>
        {reservedPuppyPayment.refund_status === "succeeded" && (
          <HStack>
            <Text fontWeight={600}>Refund Status:</Text>
            <Text>{reservedPuppyPayment.refund_status}</Text>
          </HStack>
        )}
        <Divider w="100%" />
      </VStack>
    );
  };

  const fetchBuyerInfo = async (userId) => {
    try {
      setErrorAlert(null);
      const { data } = await axios.get(
        `/api/auth0?action=get_user_metadata&userId=${userId}`
      );

      const res = {
        email: data.email,
        name:
          isEmpty(data.user_metadata) || !data.user_metadata.first_name
            ? data.nickname
            : `${data.user_metadata.first_name} ${data.user_metadata.last_name}`,
      };
      return res;
    } catch (error) {
      setErrorAlert(error?.response?.data?.error || error.message);
    }
  };

  const refundReservationFee = async (paymentId) => {
    setErrorAlert(null);
    setIsRefunding(true);
    const reservationFee = 10 * 100;

    try {
      const { data } = await axios.post("/api2/refund", {
        paymentIntentId: paymentId,
        refundAmount: reservationFee,
      });

      if (data.status === "succeeded") {
        setSuccessAlert("Reservation deposit refunded successfully.");
        setViewReservedPuppy(false);
      } else {
        setErrorAlert(
          "Failed to refund reservation deposit. Please try again."
        );
      }
    } catch (error) {
      setErrorAlert(
        "Failed to refund reservation deposit. " +
          error?.response?.data?.error || error.message
      );
    }

    setIsRefunding(false);
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

      <Header
        authorizedRole="breeder"
        bg="#F2F2F2"
        userMetadata={userMetadata}
      />

      <Modal
        isOpen={viewReservedPuppy}
        onClose={() => setViewReservedPuppy(false)}
        fontFamily="Poppins !important"
      >
        <ModalContent>
          <ModalHeader>Reservation Payment Record</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isLoadingReservedPuppy ? <CustomSpinner /> : renderPuppyPayment()}
          </ModalBody>
          {!isLoadingReservedPuppy && (
            <ModalFooter>
              <Tooltip label="By clicking this, you will refund the buyer's deposit fee for the reservation he/she made. This action indicates that the puppy has been successfully sold.">
                <Button
                  bg={theme.colors.primary}
                  colorScheme="yellow"
                  isLoading={isRefunding}
                  isDisabled={
                    reservedPuppyPayment?.refund_status === "succeeded"
                  }
                  onClick={() =>
                    refundReservationFee(reservedPuppyPayment?.payment_id)
                  }
                >
                  Release reservation deposit
                </Button>
              </Tooltip>
            </ModalFooter>
          )}
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
          <Accordion defaultIndex={[0, 1, 2, 3]} allowMultiple>
            <AccordionItem border="0 !important">
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
                          minW="350px"
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
                            <Text opacity={0.7}>Breeder</Text>
                            <Text opacity={0.7}>{`${
                              userMetadata.breeder_verified
                                ? "Verified By Admin"
                                : "Not Verified"
                            }`}</Text>

                            {/*<HStack mt={2}>
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
                          </HStack>*/}

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

                            <HStack mt={5}>
                              <StarIcon
                                h="18px"
                                w="18px"
                                color={theme.colors.primary}
                              />
                              <Text fontSize={22} fontWeight={500}>
                                Puppy Reserved
                              </Text>
                              <StarIcon
                                h="18px"
                                w="18px"
                                color={theme.colors.primary}
                              />
                            </HStack>
                            <HStack spacing={4}>
                              {reservedPuppies.length > 0 ? (
                                reservedPuppies.map((puppy) => {
                                  return (
                                    <VStack
                                      cursor="pointer"
                                      onClick={() =>
                                        viewReservedPuppyDetail(puppy.id)
                                      }
                                    >
                                      <Image
                                        src={
                                          puppy.picture?.url ||
                                          "/default-puppy-img.jpg"
                                        }
                                        borderRadius="full"
                                        w="60px"
                                        h="55px"
                                      />
                                      <Text fontSize={14}>{puppy.name}</Text>
                                    </VStack>
                                  );
                                })
                              ) : (
                                <Text>No puppy reserved</Text>
                              )}
                            </HStack>
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
                    breederVerified={userMetadata.breeder_verified || false}
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

            <AccordionItem>
              <AccordionButton>
                <AccordionIcon fontSize={30} />
                <Text fontSize={28} fontWeight={600}>
                  &emsp;Other Documents
                </Text>
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Box bg="white" borderRadius={20} p="25px">
                  <Text fontSize={16}>
                    Upload any supporting documents, certifications, or awards
                    to showcase your breeding business.
                  </Text>
                  <Box maxW={"300px !important"}>
                    <Upload
                      name="documents"
                      accept="image/*"
                      showUploadList={true}
                      multiple={true}
                      maxCount={10}
                      beforeUpload={(file) =>
                        validateImage(file, "certificate")
                      }
                      onChange={handleDocumentChange}
                      customRequest={uploadDocument}
                      fileList={documents}
                      progress={{ size: 3 }}
                    >
                      <Button
                        bg={theme.colors.primary}
                        colorScheme="yellow"
                        leftIcon={<UploadOutlined />}
                        mt={4}
                      >
                        Upload
                      </Button>
                    </Upload>
                  </Box>
                </Box>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionButton>
                <AccordionIcon fontSize={30} />
                <Text fontSize={28} fontWeight={600}>
                  &emsp;Payment History
                </Text>
              </AccordionButton>
              <AccordionPanel pb={4}>
                <ListPaymentTable
                  userId={user.sub}
                  db={db}
                  setErrorAlert={setErrorAlert}
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}
      </Box>
    </ChakraProvider>
  );
};

export const Head = () => <Seo title="Breeder Profile" />;

export default withAuthenticationRequired(BreederProfile);
