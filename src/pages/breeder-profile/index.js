import axios from "axios";
import { isEmpty } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { navigate } from "gatsby";
import countries from "i18n-iso-countries";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import {
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
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import Header from "../../components/header";
import Seo from "../../components/seo";
import CustomSpinner from "../../components/spinner";
import IcMenu from "../../images/icons/ic-menu.inline.svg";
import CameraIcon from "../../images/icons/camera.inline.svg";
import EmailIcon from "../../images/icons/email.inline.svg";
import TelephoneIcon from "../../images/icons/telephone.inline.svg";
//import DefaultProfilePicture from "../../images/user.png";
import theme from "../../theme";
import { getCookie } from "../../cookie-manager";
import { followerBox, profileIcon } from "./breeder-profile.module.css";

const BreederProfile = () => {
  const { isAuthenticated, isLoading, user } = useAuth0();

  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");

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
  const [userMetadata, setUserMetadata] = useState(defaultMetadata);
  const [connection, setConnection] = useState("");

  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [onPictureHover, setOnPictureHover] = useState(false);
  const fileInputRef = useRef(null);

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
        setConnection(data.identities[0].connection);
      }
      fetchUserMetadata();
    }
  }, [isAuthenticated, user]);

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
    tabIndex,
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
              tabIndex={tabIndex}
              type={type}
              focusBorderColor={theme.colors.primary}
              variant="flushed"
              placeholder={placeholder || label}
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
      await axios.post("/api/auth0", {
        action: "update_user_metadata",
        userId: user.sub,
        connection,
        payload: {
          user_metadata: values,
        },
      });
    } catch (e) {}
    actions.setSubmitting(false);
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

  countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
  const countryObj = countries.getNames("en", { select: "official" });
  const countryArr = Object.entries(countryObj).map(([key, value]) => {
    return {
      label: value,
      value: key,
    };
  });

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const uploadImage = (event) => {
    const file = event.target.files[0];
    console.log(file, "files");
    // You can use this file to upload to your server
  };

  return (
    isAuthenticated && (
      <ChakraProvider theme={theme}>
        <Box w="100%" px="1.5rem" bg="#F2F2F2" fontFamily="Poppins !important">
          <Header isAuthenticated={isAuthenticated} user={user} role={role} />

          <HStack ml="18px">
            <IcMenu w={29} />
            <Text fontSize={28} fontWeight={600}>
              &emsp;Breeder Profile
            </Text>
          </HStack>

          <Formik
            initialValues={userMetadata}
            enableReinitialize
            onSubmit={async (values, actions) => {
              await updateUserMetadata(values, actions);
            }}
          >
            {({ initialValues, isSubmitting, errors, touched }) => (
              <Form>
                <Flex
                  gap="30px"
                  mt="30px"
                  direction={{ base: "column", lg: "row" }}
                >
                  <Box flex={4} bg="white" borderRadius={20} p="25px">
                    <Flex px="15px" py="8px">
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
                      <Button
                        background="#F4F4F4"
                        colorScheme="gray"
                        color="#9F9F9F"
                        size="md"
                        borderRadius={54}
                      >
                        Cancel
                      </Button>
                      <Button
                        bg={theme.colors.primary}
                        colorScheme="yellow"
                        size="md"
                        borderRadius={54}
                        ml="16px"
                        isLoading={isSubmitting}
                        type="submit"
                      >
                        Save Changes
                      </Button>
                    </Flex>

                    {renderSectionTitle("GENERALS")}
                    <SimpleGrid
                      columns={3}
                      spacing={10}
                      fontWeight={500}
                      mb={10}
                    >
                      <Stack direction="column">
                        {renderInput(
                          "first_name",
                          "First name",
                          "text",
                          1,
                          "",
                          {
                            required: true,
                          }
                        )}

                        <FormControl
                          isInvalid={!!errors.password && touched.password}
                          mb={5}
                        >
                          <FormLabel>Password</FormLabel>
                          <Field
                            as={Input}
                            name="password"
                            tabIndex={4}
                            type="password"
                            focusBorderColor={theme.colors.primary}
                            variant="flushed"
                            placeholder="***************"
                            validate={(value) => {
                              return validatePassword(value);
                            }}
                          />
                          <FormErrorMessage>{errors.password}</FormErrorMessage>
                        </FormControl>
                      </Stack>
                      <Stack direction="column">
                        {renderInput("last_name", "Last name", "text", 2, "", {
                          required: true,
                        })}

                        <FormControl
                          isInvalid={
                            !!errors.retype_password && touched.retype_password
                          }
                          mb={5}
                        >
                          <FormLabel>Re-Type Password</FormLabel>
                          <Field
                            as={Input}
                            name="retype_password"
                            tabIndex={5}
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
                      </Stack>
                      <Stack direction="column">
                        {renderInput("email", "Email", "email", 3, "", {
                          disabled: true,
                        })}

                        {renderInput(
                          "phone",
                          "Phone Number",
                          "tel",
                          6,
                          "+5012345678"
                        )}
                      </Stack>
                    </SimpleGrid>

                    {renderSectionTitle("ADDRESS")}
                    <SimpleGrid
                      columns={3}
                      spacing={10}
                      fontWeight={500}
                      mb={10}
                    >
                      <Stack direction="column">
                        {renderInput(
                          "address",
                          "Address",
                          "text",
                          7,
                          "Street name, house number"
                        )}
                      </Stack>
                      <Stack direction="column">
                        {renderInput("city", "City", "text", 8)}
                      </Stack>
                      <Stack direction="column">
                        <Text>Country</Text>
                        <Select
                          name="country"
                          tabIndex={9}
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
                      </Stack>
                    </SimpleGrid>

                    {renderSectionTitle("ABOUT ME")}
                    <Textarea
                      name="about_me"
                      tabIndex={9}
                      h="150px"
                      bg="#FBFBFB"
                      borderRadius="20px"
                      border="1px solid #C2C2C2"
                      padding="20px"
                      resize="none"
                      mb={20}
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
                      <Circle size="152px" bg={theme.colors.primary}>
                        <Image
                          src={initialValues.profile_picture}
                          alt="profile picture"
                          w="122px"
                          borderRadius="122px"
                          border="4px solid white"
                          cursor="pointer"
                          opacity={onPictureHover ? 0.4 : 1}
                          onClick={handleUploadClick}
                          onMouseEnter={() => setOnPictureHover(true)}
                          onMouseLeave={() => setOnPictureHover(false)}
                        />
                        {onPictureHover && (
                          <Icon
                            as={CameraIcon}
                            boxSize="30px"
                            cursor="pointer"
                            position="absolute"
                            onClick={handleUploadClick}
                          />
                        )}
                      </Circle>
                      <Input
                        type="file"
                        name="profile_picture"
                        ref={fileInputRef}
                        onChange={uploadImage}
                        accept="image/*"
                        opacity={0}
                        h={0}
                        zIndex={-1}
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
        </Box>
      </ChakraProvider>
    )
  );
};

export const Head = () => <Seo title="Breeder Profile" />;

export default withAuthenticationRequired(BreederProfile);
