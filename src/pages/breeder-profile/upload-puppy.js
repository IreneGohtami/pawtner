import axios from "axios";
import { collection, addDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { uid } from "uid";
import { Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
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
  ModalFooter,
  ModalBody,
  NumberInput,
  NumberInputField,
  Select,
  Spacer,
  Text,
  Textarea,
  useTheme,
} from "@chakra-ui/react";

import { getCookie, setCookie } from "../../cookie-manager";
import CustomSpinner from "../../components/spinner";
import { db, storage } from "../../firebase";
import CameraIcon from "../../images/icons/camera.inline.svg";

import "react-datepicker/dist/react-datepicker.css";
import {
  cancelButton,
  datePicker,
  imgCircle,
  puppyFormInput,
  textarea,
  uploadCircle,
} from "./breeder-profile.module.css";

function UploadPuppyPage({ userId, isOpen, onClose, setUploadSuccessAlert }) {
  const theme = useTheme();
  const initialRef = useRef(null);
  const finalRef = useRef(null);

  const emptyForm = {
    name: "",
    breed: "",
    gender: "",
    location: "",
    color: "",
    price: 0,
    rehoming_date: "",
    about_puppy: "",
    picture: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [isValidating, setIsValidating] = useState(false); // For form validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [breedList, setBreedList] = useState([]);
  const [onPictureHover, setOnPictureHover] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const colors = ["Brown", "Black", "White", "Gray", "Others"];

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

  const inputProperties = (name, cursor = "pointer") => ({
    name,
    className: puppyFormInput,
    focusBorderColor: theme.colors.primary,
    variant: "outline",
    placeholder: name.charAt(0).toUpperCase() + name.slice(1),
    required: "required",
    cursor,
    value: form[name],
    onChange: (e) => {
      setForm({ ...form, [name]: e.target.value });
    },
  });

  const handleUploadPuppy = async () => {
    setUploadError("");
    if (formError || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    userId = userId.split("|")[1] || null;
    if (!userId) {
      setUploadError("Please re-login to upload puppy");
    }

    if (form.picture && imageUrl) {
      try {
        // Upload picture to firebase storage
        const puppyId = uid();
        const storageRef = ref(
          storage,
          `users/${userId}/puppies/${puppyId}.png`
        );

        const snapshot = await uploadBytes(storageRef, form.picture);
        const puppyPictureUrl = await getDownloadURL(snapshot.ref);
        setForm({ ...form, picture: puppyPictureUrl });
      } catch (error) {
        setUploadError("Error uploading puppy image. Please try again.");
        setForm({ ...form, picture: "" });
        console.log("Error uploading puppy image:", error);
        return;
      }
    }

    try {
      // Upload puppy detail to firebase database
      await addDoc(collection(db, "puppy"), form);
    } catch (error) {
      setUploadError("Error uploading puppy. Please try again.");
      console.log("Error uploading puppy to DB:", error);
      return;
    }

    setUploadSuccessAlert("Puppy uploaded successfully!");
    setIsSubmitting(false);
    closeModal();
  };

  const closeModal = () => {
    setForm(emptyForm);
    setFormError("");
    setImageUrl("");
    setUploadError("");
    setIsSubmitting(false);
    setIsValidating(false);
    setLoading(false);
    onClose();
  };

  const renderErrorMessage = () => {
    return (
      <FormErrorMessage position="absolute" fontSize="11px" mt={0}>
        &emsp; &emsp; Required
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
      !form.price
    ) {
      return false;
    }
    return true;
  };

  const validateImage = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      setUploadError("You can only upload JPG/PNG file");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      setUploadError("Image must be smaller than 2MB");
    }
    return isJpgOrPng && isLt2M;
  };

  const handleChange = (event) => {
    if (isSubmitting) {
      return;
    }

    const file = event.file.originFileObj;
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target.result);
        setForm({ ...form, picture: file });
        setFormError("");
        setLoading(false);
      };
      reader.readAsDataURL(file);
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
            <Text fontSize={22}>Upload Here</Text>
            <Spacer />
            <Button
              className={cancelButton}
              onClick={closeModal}
              ref={finalRef}
            >
              Cancel
            </Button>
            <Button
              bg={theme.colors.primary}
              colorScheme="yellow"
              borderRadius={54}
              ml={3}
              w="160px"
              onClick={handleUploadPuppy}
              isLoading={isSubmitting}
            >
              Upload
            </Button>
          </Flex>
        </ModalHeader>
        <ModalBody>
          <Flex>
            <Spacer />
            <Box flex={3}>
              <FormControl mb={5} display="inline-grid" justifyContent="center">
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
                      <Upload
                        name="picture"
                        accept="image/*"
                        className={uploadCircle}
                        showUploadList={false}
                        beforeUpload={validateImage}
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
                      opacity={onPictureHover ? 0.4 : 1}
                      onMouseEnter={() => setOnPictureHover(true)}
                      onMouseLeave={() => setOnPictureHover(false)}
                    />
                  )}
                </Circle>
              </FormControl>
              <FormControl mb={5} isInvalid={isValidating && !form.name}>
                <Input ref={initialRef} {...inputProperties("name", "text")} />
                {renderErrorMessage()}
              </FormControl>
              <HStack mb={5}>
                <FormControl isInvalid={isValidating && !form.breed}>
                  <Select {...inputProperties("breed")}>
                    {breedList.map((breed) => (
                      <option key={breed} value={breed}>
                        {breed.charAt(0).toUpperCase() + breed.slice(1)}
                      </option>
                    ))}
                  </Select>
                  {renderErrorMessage()}
                </FormControl>
                <FormControl isInvalid={isValidating && !form.gender}>
                  <Select {...inputProperties("gender")}>
                    <option key="male" value="male">
                      Male
                    </option>
                    <option key="female" value="female">
                      Female
                    </option>
                  </Select>
                  {renderErrorMessage()}
                </FormControl>
              </HStack>
              <HStack mb={5}>
                <FormControl>
                  <Input {...inputProperties("location", "text")} />
                </FormControl>
                <FormControl isInvalid={isValidating && !form.color}>
                  <Select {...inputProperties("color")}>
                    {colors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </Select>
                  {renderErrorMessage()}
                </FormControl>
              </HStack>
              <HStack mb={5}>
                <FormControl isInvalid={isValidating && !form.price}>
                  <NumberInput min={0} focusBorderColor={theme.colors.primary}>
                    <NumberInputField {...inputProperties("price", "text")} />
                  </NumberInput>
                  {renderErrorMessage()}
                </FormControl>
                <FormControl>
                  <DatePicker
                    name="rehoming_date"
                    placeholderText="Rehoming Date"
                    dateFormat="dd/MM/yyyy"
                    className={`${puppyFormInput} ${datePicker}`}
                    selected={form.rehoming_date || new Date()}
                    value={form.rehoming_date}
                    onChange={(date) =>
                      setForm({ ...form, rehoming_date: date })
                    }
                  />
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
                  About Puppy
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
                />
              </FormControl>
            </Box>
            <Spacer />
          </Flex>
        </ModalBody>

        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default UploadPuppyPage;
