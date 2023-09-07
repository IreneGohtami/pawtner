import React /*, { useEffect, useState }*/ from "react";
import {
  Box,
  Button,
  Flex,
  Image,
  SimpleGrid,
  Text,
  useTheme,
} from "@chakra-ui/react";
import { graphql } from "gatsby";
//import { collection, getDoc, query, where, orderBy } from "firebase/firestore";
//import { db } from "../firebase";

import Header from "../components/header";
import Seo from "../components/seo";
import { button, label, labelText } from "./puppy-detail.module.css";

const PuppyDetail = ({ data }) => {
  const { puppy } = data;
  const theme = useTheme();
  /*const { id } = pageContext;
  const [puppy, setPuppy] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorAlert, setErrorAlert] = useState("");

  useEffect(() => {
    async function getPuppy() {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, "puppy"),
          //where("status", "==", "available"),
          orderBy("created_at", "asc")
        );
        const querySnapshot = await getDoc(q);
        if (querySnapshot.exists()) {
          setPuppy(querySnapshot.data());
        }
      } catch (e) {
        setErrorAlert("Failed to fetch puppy info. Please try again.");
        console.log(e, "Failed to fetch puppy info");
      }
      setIsLoading(false);
    }
    getPuppy();
  }, []);*/

  //const { puppy } = data; // Access puppy data here

  const mapStatus = (status) => {
    switch (status) {
      case "Available":
        return "Yes";
      default:
        return "No";
    }
  };

  return (
    <Box fontFamily="Poppins !important" pb="50px">
      <Header authorizedRole="all" bg="#FBFBFB" />
      <Text fontSize={45} fontWeight={600} m={5} textAlign="center">
        Puppy Details
      </Text>

      <Flex px="40px">
        <Box display="flex" flex={1} pl={3} pr={4}>
          <Image
            w="auto"
            maxH="773px"
            objectFit="cover"
            borderRadius="20px"
            border={puppy.picture?.url ? 0 : "2px solid #E2E8F0"}
            padding={puppy.picture?.url ? 0 : "15px"}
            src={puppy.picture?.url || "/default-puppy-img.jpg"}
            alt={`${puppy.name} - ${puppy.breed}`}
          />
        </Box>
        <Box pl={4} pr={3}>
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
              bg={theme.colors.primary}
              color="white"
              colorScheme="yellow"
              size="md"
              className={button}
              mt={8}
            >
              Contact with Breeder
            </Button>
            <Button className={button} mt={8}>
              Application Form
            </Button>
            <Button className={button}>Apply</Button>
            <Button className={button}>Book a Showing</Button>
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
    </Box>
  );
};

export const query = graphql`
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
