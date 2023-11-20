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
  ModalBody,
  ModalContent,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { graphql, navigate } from "gatsby";

import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
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

const PuppyDetail = ({ data }) => {
  const { puppy } = data;
  const { isAuthenticated, user } = useAuth0();
  const [isFavorite, setIsFavorite] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorAlert, setErrorAlert] = useState(null);
  const [displayChat, setDisplayChat] = useState(false);
  const [breederInfo, setBreederInfo] = useState(null);

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

  useEffect(() => {
    async function fetchBreederInfo() {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          `/api/auth0?action=get_user_metadata&userId=${puppy.owner_id}`
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
        return "No";
    }
  };

  return (
    <Box fontFamily="Poppins !important">
      {/* Chat modal */}
      <Modal
        isOpen={displayChat}
        onClose={() => setDisplayChat(false)}
        size="full"
      >
        <ModalContent>
          <ModalBody p={0}>
            <ChatPage
              breederId={puppy.owner_id.split("|").pop()}
              breederInfo={breederInfo}
              setDisplayChat={setDisplayChat}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Toast description={errorAlert} status="error" setAlert={setErrorAlert} />
      <Header authorizedRole="all" bg="#FBFBFB" />
      <Text fontSize={45} fontWeight={600} m={5} textAlign="center">
        Puppy Details
      </Text>
      <Flex px="40px">
        <Box display="block" pl={3} textAlign="right">
          <Image
            w="auto"
            maxH="650px"
            objectFit="cover"
            borderRadius="20px"
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
        <Box w="40%" pl="20px" pr={3}>
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
              mt={8}
              onClick={() => setDisplayChat(true)}
            >
              Contact Breeder
            </Button>
            <Button
              className={button}
              mt={8}
              onClick={() =>
                navigate(`/breeder/${puppy.owner_id.split("|").pop()}`)
              }
            >
              View Breeder's Profile
            </Button>
            {/*<Button className={button}>Book a Showing</Button>*/}
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
    }
  }
`;

export const Head = () => <Seo title="Puppy" />;

export default PuppyDetail;
