import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { LoadingOutlined, HeartFilled, HeartOutlined } from "@ant-design/icons";
import {
  Box,
  Button,
  Flex,
  Image,
  Modal,
  SimpleGrid,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { graphql, navigate } from "gatsby";

import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

import ChatPage from "../components/chat";
import Header from "../components/header";
import Footer from "../components/footer";
import Seo from "../components/seo";
import Toast from "../components/toast";
import {
  button,
  label,
  labelText,
  favoriteButton,
} from "./puppy-detail.module.css";

const FREE_TIER = true;

const PuppyDetail = ({ data }) => {
  const { puppy } = data;
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

  const { isAuthenticated, user } = useAuth0();
  const [isFavorite, setIsFavorite] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [errorAlert, setErrorAlert] = useState(null);
  const [successAlert, setSuccessAlert] = useState(null);
  const [displayChat, setDisplayChat] = useState(false);
  const [breederInfo, setBreederInfo] = useState(defaultMetadata);
  const [stripePaymentLink, setStripePaymentLink] = useState(null);

  useEffect(() => {
    async function fetchBreederInfo() {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          `/api/auth0?action=get_user_metadata&userId=${puppy.owner_id}`
        );
        if (data?.user_metadata) {
          setBreederInfo(data.user_metadata);
        }
        setErrorAlert(null);
      } catch (error) {
        setErrorAlert(error?.response?.data || error.message);
      }
      setIsLoading(false);
    }
    fetchBreederInfo();
  }, []);

  // Check for favorite
  useEffect(() => {
    async function checkFavorite() {
      if (isAuthenticated && user) {
        try {
          const q = query(
            collection(db, "favorite"),
            where("user_id", "==", user.sub),
            where("animal_id", "==", puppy.id)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const result = querySnapshot.docs[0];
            setIsFavorite(result.id);
          }
        } catch (e) {
          console.log(e, "error fetching favorites");
        }
        setStripePaymentLink(
          `https://buy.stripe.com/test_bIYcQ74yk3Svf4s144?prefilled_email=${
            user.email
          }&client_reference_id=${puppy.id}_${user.sub.replace("|", "_")}`
        );
      }
    }
    checkFavorite();
  }, [isAuthenticated, user]);

  const addToFavorites = async () => {
    if (isAuthenticated && user) {
      setIsLoading(true);
      const result = await addDoc(collection(db, "favorite"), {
        user_id: user.sub,
        animal_id: puppy.id,
      });
      setIsLoading(false);
      setIsFavorite(result.id);
    } else {
      setErrorAlert("Please login first");
    }
  };

  const removeFromFavorites = async () => {
    if (isAuthenticated && user) {
      setIsLoading(true);
      await deleteDoc(doc(db, "favorite", isFavorite));
      setIsLoading(false);
      setIsFavorite("");
    }
  };

  const mapStatus = (status) => {
    switch (status) {
      case "Available":
        return "Yes";
      default:
        return status;
    }
  };

  const checkPuppyStatus = async () => {
    setErrorAlert(null);
    setSuccessAlert(null);
    setIsReserving(true);
    try {
      const docRef = doc(db, "puppy", puppy.id);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const result = docSnapshot.data();
        const status = result.status;

        if (status !== "Available") {
          setErrorAlert("Sorry, this puppy is no longer available.");
        } else {
          if (FREE_TIER) {
            const puppyRef = doc(db, "puppy", puppy.id);
            await updateDoc(puppyRef, {
              status: "Reserved",
            });
            setSuccessAlert(
              "Puppy reserved successfully! Please wait for the breeder to confirm your reservation."
            );
          } else {
            window.open(stripePaymentLink, "_blank");
          }
        }
      } else {
        setErrorAlert("Sorry, this puppy is no longer available.");
      }
    } catch (error) {
      setErrorAlert("Sorry, there's a network error. Please reload the page.");
    }
    setIsReserving(false);
  };

  return (
    <Box fontFamily="Poppins !important">
      {/* Chat modal */}
      <Modal
        isOpen={displayChat}
        onClose={() => setDisplayChat(false)}
        size="full"
      >
        <ChatPage
          breederId={puppy.owner_id.split("|").pop()}
          breederInfo={breederInfo}
          setDisplayChat={setDisplayChat}
        />
      </Modal>

      <Toast description={errorAlert} status="error" setAlert={setErrorAlert} />
      <Toast
        description={successAlert}
        status="success"
        setAlert={setSuccessAlert}
      />

      <Header authorizedRole="all" bg="#FBFBFB" />
      <Text fontSize={45} fontWeight={600} m={5} textAlign="center">
        Puppy Details
      </Text>
      <Flex px="40px" direction={{ base: "column", md: "row" }}>
        <Box flex="1" display="block" pl={3} textAlign="right">
          <Image
            w="auto"
            maxH="650px"
            objectFit="cover"
            borderRadius="20px"
            margin="0 auto"
            border={puppy.picture?.url ? 0 : "2px solid #E2E8F0"}
            padding={puppy.picture?.url ? 0 : "15px"}
            src={puppy.picture?.url || "/default-puppy-img.jpg"}
            alt={`${puppy.name} - ${puppy.breed}`}
          />
          {isLoading ? (
            <LoadingOutlined className={favoriteButton} spin />
          ) : isFavorite ? (
            <HeartFilled
              className={favoriteButton}
              onClick={removeFromFavorites}
            />
          ) : (
            <HeartOutlined
              className={favoriteButton}
              onClick={addToFavorites}
            />
          )}
        </Box>
        <Box pl="20px" pr={3}>
          <SimpleGrid columns={2} spacing={3} textAlign="left">
            <Text className={label}>Puppy Name</Text>
            <Text className={labelText}>{puppy.name}</Text>

            <Text className={label}>Breed</Text>
            <Text className={labelText}>
              {puppy.breed.charAt(0).toUpperCase() + puppy.breed.slice(1)}
            </Text>

            <Text className={label}>Gender</Text>
            <Text className={labelText}>{puppy.gender}</Text>

            <Text className={label}>Location</Text>
            <Text className={labelText}>{puppy.location || "N/A"}</Text>

            <Text className={label}>Color</Text>
            <Text className={labelText}>{puppy.color}</Text>

            <Text className={label}>Price</Text>
            <Text className={labelText}>${puppy.price.toLocaleString()}</Text>

            <Text className={label}>Rehoming Date</Text>
            <Text className={labelText}>{puppy.rehoming_date || "N/A"}</Text>

            <Text className={label}>Size</Text>
            <Text className={labelText}>{puppy.size}</Text>

            <Text className={label}>Availability</Text>
            <Text className={labelText}>{mapStatus(puppy.status)}</Text>

            <Button
              className={button}
              onClick={() => setDisplayChat(true)}
              isDisabled={puppy.owner_id === user?.sub}
            >
              Contact Breeder
            </Button>
            <Button
              className={button}
              onClick={() =>
                navigate(`/breeder/${puppy.owner_id.split("|").pop()}`)
              }
            >
              View Breeder's Profile
            </Button>
            <Button
              className={button}
              isLoading={isReserving}
              isDisabled={
                puppy.owner_id === user?.sub ||
                !stripePaymentLink ||
                puppy.status !== "Available"
              }
              onClick={() => checkPuppyStatus()}
            >
              <Tooltip
                label={
                  puppy.status !== "Available"
                    ? "Puppy is not available"
                    : !stripePaymentLink
                    ? "Please login first"
                    : puppy.owner_id === user?.sub
                    ? "Can't reserve your own puppy"
                    : "Only reserve a puppy when invited to reserve by a breeder"
                }
                placement="bottom"
              >
                Reserve *
              </Tooltip>
            </Button>
            <Button
              className={button}
              isDisabled={
                !puppy.application_form ||
                puppy.status !== "Available" ||
                puppy.owner_id === user?.sub
              }
              onClick={() => window.open(puppy.application_form, "_blank")}
            >
              <Tooltip
                label={
                  puppy.owner_id !== user?.sub
                    ? "Fill application form so the breeder can contact you to apply"
                    : "Can't apply for your own puppy"
                }
                placement="bottom"
              >
                Application form *
              </Tooltip>
            </Button>
          </SimpleGrid>
        </Box>
      </Flex>
      <Box p="40px">
        <Text fontSize={26} fontWeight={600} mb={3}>
          ABOUT PUPPY
        </Text>
        <Box borderRadius={20} border="1px solid #C2C2C2" bg="#FBFBFB" p={5}>
          {puppy.about_puppy || "N/A"}
        </Box>
      </Box>
      <Footer currentPage="puppy-detail" />
    </Box>
  );
};

export const pageQuery = graphql`
  query ($id: String!) {
    puppy(id: { eq: $id }) {
      id
      name
      breed
      gender
      price
      color
      location
      rehoming_date
      picture {
        url
        reference
      }
      size
      status
      about_puppy
      owner_id
      application_form
    }
  }
`;

export const Head = () => <Seo title="Puppy" />;

export default PuppyDetail;
