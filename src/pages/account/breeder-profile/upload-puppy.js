import axios from "axios";
import { isEmpty } from "lodash";
import moment from "moment";
import { collection, doc, addDoc, updateDoc } from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { uid } from "uid";
import { Upload } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Box,
  Button,
  Circle,
  Flex,
  FormControl,
  FormErrorMessage,
  HStack,
  Icon,
  Image,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  NumberInput,
  NumberInputField,
  Select,
  Spacer,
  Text,
  Textarea,
  useTheme,
} from "@chakra-ui/react";

import { getCookie, setCookie } from "../../../cookie-manager";
import CustomSpinner from "../../../components/spinner";
import CameraIcon from "../../../images/icons/camera.inline.svg";

import {
  cancelButton,
  datePicker,
  imgCircle,
  puppyFormInput,
  textarea,
} from "./breeder-profile.module.css";
import "react-datepicker/dist/react-datepicker.css";

const UploadPuppyPage = ({
  userId,
  breederVerified,
  isOpen,
  onClose,
  setSuccessAlert,
  db,
  storage,
  action,
  puppyData,
}) => {
  const theme = useTheme();
  const initialRef = useRef(null);
  const finalRef = useRef(null);

  const emptyForm = {
    owner_id: userId,
    name: "",
    breed: "",
    gender: "",
    location: "",
    color: "",
    price: 0,
    rehoming_date: "",
    about_puppy: "",
    picture: null,
    size: "",
    status: "Unlisted",
    certificates: [],
    application_form: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [isValidating, setIsValidating] = useState(false); // For form validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [breedList, setBreedList] = useState([]);
  const [onPictureHover, setOnPictureHover] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadCertificateError, setUploadCertificateError] = useState("");
  const [deletedCertificates, setDeletedCertificates] = useState([]);
  const colors = ["Brown", "Black", "White", "Gray", "Others"];
  const statuses = ["Available", "Adopted", "Reserved", "Unlisted"];
  const sizes = ["Small", "Medium", "Large"];

  useEffect(() => {
    async function listDogBreed() {
      const cookieBreedList = getCookie("breed_list");
      if (cookieBreedList) {
        setBreedList(JSON.parse(cookieBreedList));
      } else {
        try {
          const { data } = await axios.get(
            `https://dog.ceo/api/breeds/list/all`
          );
          const breeds = Object.keys(data.message);

          breeds.forEach((breed, index) => {
            if (data.message[breed] && data.message[breed].length) {
              // Have sub-breed
              let additionalSubBreeds = [];
              data.message[breed].forEach((subBreed, subIndex) => {
                if (subIndex === 0) {
                  breeds[index] = `${breed} (${data.message[breed][0]})`;
                } else {
                  // Insert new sub-breed as new breed
                  additionalSubBreeds.push(`${breed} (${subBreed})`);
                }
              });
              if (additionalSubBreeds.length) {
                breeds.splice(index + 1, 0, ...additionalSubBreeds);
              }
            }
          });
          setBreedList(breeds);
          setCookie("breed_list", JSON.stringify(breeds), 30);
        } catch (e) {
          console.log(e, "error listDogBreed");
        }
      }
    }
    listDogBreed();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setForm(action !== "add" ? puppyData : emptyForm);
      setImageUrl(
        action !== "add" && !isEmpty(puppyData.picture)
          ? puppyData.picture.url
          : ""
      );

      setCertificates([]); // reset
      if (puppyData?.certificates?.length) {
        const fileList = [];
        puppyData.certificates.forEach((certificate) => {
          fileList.push({
            uid: certificate.reference,
            name: `${certificate.reference}.png`,
            status: "done",
            url: certificate.url,
          });
        });
        setCertificates(fileList);
      }
    }, 300);
  }, [action, puppyData]);

  const inputProperties = (name, cursor = "pointer") => ({
    name,
    className: puppyFormInput,
    focusBorderColor: theme.colors.primary,
    variant: "outline",
    placeholder:
      name !== "application_form"
        ? name.charAt(0).toUpperCase() + name.slice(1)
        : "Enter URL such as Google Form, Typeform, etc.",
    cursor,
    value: form[name],
    onChange: (e) => {
      const value = e.target.value;
      setForm({ ...form, [name]: name === "price" ? Number(value) : value });
    },
    isReadOnly: action === "view",
  });

  const handleUploadPuppy = async () => {
    setUploadError("");
    setUploadCertificateError("");
    if (formError || !validateForm()) {
      return;
    }

    let hasError = false;
    certificates.forEach((certificate) => {
      if (certificate.error) {
        hasError = true;
        setUploadCertificateError("One or more certificates are invalid.");
        return;
      }
    });
    if (hasError) {
      return;
    }

    setIsSubmitting(true);
    userId = userId.split("|")[1] || null;
    if (!userId) {
      setUploadError("Please re-login to upload puppy");
    }

    let puppyImageRefId = uid();
    let puppyPictureUrl = "";
    let isPictureChanged = false;

    if (form.picture && imageUrl) {
      if (action === "edit" && puppyData.picture?.url === imageUrl) {
        // skip uploading picture if picture is not changed
      } else {
        isPictureChanged = true;
      }

      puppyImageRefId = puppyData.picture?.reference || puppyImageRefId;
      if (isPictureChanged) {
        try {
          // Upload picture to firebase storage
          const storageRef = ref(
            storage,
            `users/${userId}/puppies/${puppyImageRefId}.png`
          );

          const snapshot = await uploadBytes(storageRef, form.picture);
          puppyPictureUrl = await getDownloadURL(snapshot.ref);
          setForm({ ...form, picture: puppyPictureUrl });
        } catch (error) {
          setUploadError("Error uploading puppy image. Please try again.");
          setIsSubmitting(false);
          setForm({ ...form, picture: null });
          return;
        }
      }
    }

    // Handle certificate upload & deletion
    const certificateList = [];
    if (certificates.length) {
      let uploadFailed = false;
      for (let i = 0; i < certificates.length; i++) {
        const certificate = certificates[i];
        if (certificate.status === "done") {
          certificateList.push({
            reference: certificate.uid,
            url: certificate.url,
          });
          continue;
        }
        const certificateRefId = uid();
        try {
          const storageRef = ref(
            storage,
            `users/${userId}/documents/certificates/${certificateRefId}.png`
          );

          const snapshot = await uploadBytes(
            storageRef,
            certificate.originFileObj
          );
          const certificateUrl = await getDownloadURL(snapshot.ref);
          certificateList.push({
            reference: certificateRefId,
            url: certificateUrl,
          });
        } catch (error) {
          setUploadError("Error uploading certificate. Please try again.");
          setIsSubmitting(false);
          uploadFailed = true;
          return;
        }
      }

      if (uploadFailed) {
        return;
      }
    }

    deletedCertificates.forEach(async (certificate) => {
      const storageRef = ref(
        storage,
        `users/${userId}/documents/certificates/${certificate}.png`
      );
      await deleteObject(storageRef);
    });

    setForm({ ...form, certificates: certificateList });

    const formattedDate = form.rehoming_date
      ? moment(form.rehoming_date).format("DD/MM/YYYY")
      : "";
    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    // React setForm is async and doesn't reflect the form value immediately
    const formExt = {
      rehoming_date: formattedDate,
      ...(isPictureChanged && {
        picture: {
          reference: puppyImageRefId,
          url: puppyPictureUrl,
        },
      }),
      ...(action === "add" && { created_at: now }),
      updated_at: now,
      certificates: certificateList,
    };

    try {
      // Upload puppy detail to firebase database
      if (action === "edit") {
        const puppyRef = doc(db, "puppy", puppyData.id);
        delete form.id;
        await updateDoc(puppyRef, { ...form, ...formExt });
      } else {
        await addDoc(collection(db, "puppy"), {
          ...form,
          ...formExt,
        });
      }
    } catch (error) {
      setUploadError("Error uploading puppy. Please try again.");
      setIsSubmitting(false);
      return;
    }

    setSuccessAlert(
      `Puppy ${
        action === "edit" ? "updated" : "uploaded"
      } successfully! Changes can take up to 10 minutes to reflect.`
    );
    setIsSubmitting(false);
    closeModal();
  };

  const closeModal = () => {
    setForm(emptyForm);
    setFormError("");
    setImageUrl("");
    setUploadError("");
    setUploadCertificateError("");
    setCertificates([]);
    setDeletedCertificates([]);
    setIsSubmitting(false);
    setIsValidating(false);
    setLoading(false);
    onClose();
  };

  const renderErrorMessage = (msg = "Required") => {
    return (
      <FormErrorMessage position="absolute" fontSize="11px" mt={0}>
        &emsp; &emsp; {msg}
      </FormErrorMessage>
    );
  };

  const validateForm = () => {
    setIsValidating(true);
    if (
      !form.name ||
      !form.breed ||
      !form.gender ||
      !form.color ||
      !form.price ||
      !form.size ||
      !form.status
    ) {
      return false;
    }
    // User can only list puppy when their breeder profile is verified
    if (form.status === "Available" && !breederVerified) {
      setFormError(
        'Your profile must be verified by our admin first to list puppy. Please set status to "Unlisted".'
      );
      return false;
    }
    if (form.application_form && !isValidURL(form.application_form)) {
      return false;
    }
    return true;
  };

  const validateImage = (file, type = "profile") => {
    setUploadError("");
    setUploadCertificateError("");

    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      const errMsg = "You can only upload JPG/PNG file";
      type === "profile"
        ? setUploadError(errMsg)
        : setUploadCertificateError(errMsg);
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      const errMsg = "Image must be smaller than 2MB";
      type === "profile"
        ? setUploadError(errMsg)
        : setUploadCertificateError(errMsg);
    }

    return isJpgOrPng && isLt2M;
  };

  const handleChange = (event) => {
    if (isSubmitting) {
      return;
    }

    const file = event.file;
    if (file && !uploadError) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target.result);
        setForm({ ...form, picture: file });
        setFormError("");
        setLoading(false);
      };
      reader.readAsDataURL(file?.originFileObj || file);
    }
  };

  const handleCertificateChange = (event) => {
    if (isSubmitting) {
      return;
    }

    const { file, fileList } = event;
    const { status } = file;

    if (status === "removed") {
      const newCertificates = certificates.filter(
        (certificate) => certificate.uid !== file.uid
      );
      setCertificates(newCertificates);
      setDeletedCertificates([...deletedCertificates, file.uid]);
    } else if (file) {
      if (status === "error") {
        // change to pending so it doesn't have the default error cannot post 404
        file.status = "pending";
      } else {
        // no status means it failed validateImage validation
        fileList[fileList.length - 1].status = "error";
        fileList[fileList.length - 1].error = {};
        fileList[fileList.length - 1].error.message = uploadCertificateError;
      }

      setCertificates(event.fileList);
    }
  };

  const isValidURL = (str) => {
    try {
      new URL(str);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <Modal
      size="5xl"
      initialFocusRef={initialRef}
      finalFocusRef={finalRef}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent p={5}>
        <ModalHeader>
          <Flex>
            <Text fontSize={22}>Puppy Details</Text>
            <Spacer />
            <Button
              className={cancelButton}
              onClick={closeModal}
              ref={finalRef}
              w="120px"
            >
              {action !== "view" ? "Cancel" : "Close"}
            </Button>
            {action !== "view" && (
              <Button
                bg={theme.colors.primary}
                colorScheme="yellow"
                borderRadius={54}
                ml={3}
                w="160px"
                onClick={handleUploadPuppy}
                isLoading={isSubmitting}
              >
                {action === "edit" ? "Update" : "Upload"}
              </Button>
            )}
          </Flex>
        </ModalHeader>
        <ModalBody>
          <Flex>
            <Spacer />
            <Box flex={3}>
              <FormControl mb={5} display="inline-grid" justifyItems="center">
                {(formError || uploadError) && (
                  <Text color="red" mb={2}>
                    {formError || uploadError}
                  </Text>
                )}
                <Circle size="250px" border="1px dashed black">
                  {/* Input file will be hidden behind preview image */}
                  {loading || isSubmitting ? (
                    <CustomSpinner />
                  ) : (
                    <>
                      {action !== "view" && (
                        <Upload
                          name="picture"
                          accept="image/*"
                          showUploadList={false}
                          beforeUpload={(file) =>
                            validateImage(file, "profile")
                          }
                          onChange={handleChange}
                        >
                          {!imageUrl ? (
                            <Box textAlign="center">
                              <PlusOutlined /> Add puppy picture
                            </Box>
                          ) : (
                            <Icon
                              as={CameraIcon}
                              boxSize="30px"
                              cursor="pointer"
                              position="relative"
                              zIndex="1"
                            />
                          )}
                        </Upload>
                      )}
                    </>
                  )}
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt="puppy profile picture"
                      className={imgCircle}
                      maxW="250px"
                      maxH="250px"
                      position="absolute"
                      opacity={onPictureHover && action !== "view" ? 0.4 : 1}
                      onMouseEnter={() => setOnPictureHover(true)}
                      onMouseLeave={() => setOnPictureHover(false)}
                    />
                  )}
                </Circle>
              </FormControl>
              <HStack mb={5}>
                <FormControl isInvalid={isValidating && !form.name}>
                  <Input
                    ref={initialRef}
                    {...inputProperties("name", "text")}
                  />
                  {renderErrorMessage()}
                </FormControl>
              </HStack>
              <HStack mb={5}>
                <FormControl isInvalid={isValidating && !form.breed}>
                  {action === "view" ? (
                    <Input
                      {...inputProperties("breed", "text")}
                      value={
                        form.breed.charAt(0).toUpperCase() + form.breed.slice(1)
                      }
                    />
                  ) : (
                    <Select {...inputProperties("breed")}>
                      {breedList.map((breed) => (
                        <option key={breed} value={breed}>
                          {breed.charAt(0).toUpperCase() + breed.slice(1)}
                        </option>
                      ))}
                    </Select>
                  )}
                  {renderErrorMessage()}
                </FormControl>
                <FormControl isInvalid={isValidating && !form.gender}>
                  {action === "view" ? (
                    <Input {...inputProperties("gender", "text")} />
                  ) : (
                    <Select {...inputProperties("gender")}>
                      <option key="male" value="Male">
                        Male
                      </option>
                      <option key="female" value="Female">
                        Female
                      </option>
                    </Select>
                  )}
                  {renderErrorMessage()}
                </FormControl>
              </HStack>
              <HStack mb={5}>
                <FormControl>
                  <Input {...inputProperties("location", "text")} />
                </FormControl>
                <FormControl isInvalid={isValidating && !form.color}>
                  {action === "view" ? (
                    <Input {...inputProperties("color", "text")} />
                  ) : (
                    <Select {...inputProperties("color")}>
                      {colors.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </Select>
                  )}
                  {renderErrorMessage()}
                </FormControl>
              </HStack>
              <HStack mb={5}>
                <FormControl isInvalid={isValidating && !form.price}>
                  <NumberInput
                    name="price"
                    min={0}
                    focusBorderColor={theme.colors.primary}
                    value={form.price}
                    isReadOnly={action === "view"}
                    onChange={(value) => {
                      setForm({ ...form, price: Number(value) });
                    }}
                  >
                    <NumberInputField
                      className={puppyFormInput}
                      focusBorderColor={theme.colors.primary}
                      variant="outline"
                      placeholder="Price"
                    />
                  </NumberInput>
                  {renderErrorMessage()}
                </FormControl>
                <FormControl>
                  <DatePicker
                    name="rehoming_date"
                    placeholderText="Rehoming Date"
                    dateFormat="dd/MM/yyyy"
                    className={`${puppyFormInput} ${datePicker}`}
                    selected={
                      form.rehoming_date &&
                      moment(form.rehoming_date, "DD/MM/YYYY", true).isValid()
                        ? moment(form.rehoming_date, "DD/MM/YYYY").toDate()
                        : ""
                    }
                    onChange={(date) => {
                      setForm({
                        ...form,
                        rehoming_date: date,
                      });
                    }}
                    readOnly={action === "view"}
                  />
                </FormControl>
              </HStack>
              <HStack>
                <FormControl isInvalid={isValidating && !form.size}>
                  {action === "view" ? (
                    <Input {...inputProperties("size", "text")} />
                  ) : (
                    <Select {...inputProperties("size")}>
                      {sizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </Select>
                  )}
                  {renderErrorMessage()}
                </FormControl>
                <FormControl
                  isInvalid={
                    isValidating &&
                    form.status === "Available" &&
                    !breederVerified
                  }
                >
                  {action === "view" ? (
                    <Input {...inputProperties("status", "text")} />
                  ) : (
                    <Select {...inputProperties("status")}>
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormControl>
              </HStack>
            </Box>
            <Spacer />
          </Flex>
          <Flex mt={4}>
            <Spacer />
            <Box flex={4}>
              <FormControl>
                <Text fontWeight={600} mb={3}>
                  About puppy
                </Text>
                <Textarea
                  name="about_puppy"
                  className={textarea}
                  focusBorderColor={theme.colors.primary}
                  placeholder="Describe your puppy!"
                  value={form.about_puppy}
                  onChange={(e) => {
                    setForm({ ...form, about_puppy: e.target.value });
                  }}
                  isReadOnly={action === "view"}
                />
              </FormControl>
            </Box>
            <Spacer />
          </Flex>
          <Flex mt={4}>
            <Spacer />
            <Box flex={4}>
              <Text fontWeight={600} mb={3}>
                Puppy certificate(s)
              </Text>
              {uploadCertificateError && (
                <Text color="red" mb={2}>
                  {uploadCertificateError}
                </Text>
              )}
              <Upload
                name="certificates"
                accept="image/*"
                showUploadList={true}
                multiple={true}
                maxCount={3}
                beforeUpload={(file) => validateImage(file, "certificate")}
                onChange={handleCertificateChange}
                fileList={certificates}
                disabled={action === "view"}
              >
                {action !== "view" && (
                  <Button
                    leftIcon={<UploadOutlined />}
                    bg={theme.colors.primary}
                    colorScheme="yellow"
                  >
                    Upload (Max: 3)
                  </Button>
                )}
              </Upload>
            </Box>
            <Spacer />
          </Flex>
          <Flex mt={4}>
            <Spacer />
            <Box flex={4}>
              <Text fontWeight={600} mb={3}>
                Application form
              </Text>
              <FormControl
                isInvalid={isValidating && !isValidURL(form.application_form)}
              >
                <Input {...inputProperties("application_form", "text")} />
                {renderErrorMessage("Application form must be a valid URL.")}
              </FormControl>
            </Box>
            <Spacer />
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default UploadPuppyPage;
