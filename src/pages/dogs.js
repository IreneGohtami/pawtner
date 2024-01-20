import { graphql, navigate } from "gatsby";
import React, { useEffect, useState } from "react";
import {
  Button,
  Heading,
  Flex,
  Image,
  Input,
  SimpleGrid,
  Spacer,
  Text,
  VStack,
  Select,
} from "@chakra-ui/react";
import theme from "../theme";
import Header from "../components/header";
import Footer from "../components/footer";
import Seo from "../components/seo";

const DogsPage = ({ data, location }) => {
  const [puppyList, setPuppyList] = useState(data.allPuppy.nodes);
  const [search, setSearch] = useState(
    new URLSearchParams(location.search).get("search") || ""
  );
  const [status, setStatus] = useState("");

  useEffect(() => {
    let tempAllPuppy = data.allPuppy.nodes;
    if (search) {
      tempAllPuppy = data.allPuppy.nodes.filter(
        (puppy) =>
          puppy.name.toLowerCase().includes(search.toLowerCase()) ||
          puppy.breed.toLowerCase().includes(search.toLowerCase())
      );
      setPuppyList(tempAllPuppy);
    }
    if (status) {
      setPuppyList(tempAllPuppy.filter((puppy) => puppy.status === status));
    }

    if (!search && !status) {
      setPuppyList(data.allPuppy.nodes);
    }
  }, [search, status]);

  const renderPuppy = (puppy) => {
    return (
      <VStack key={puppy.id} spacing={4}>
        <Image
          w={[150, 200, 250, 300]}
          h={[150, 200, 250, 300]}
          objectFit="cover"
          borderRadius="20px"
          border={puppy.picture?.url ? 0 : "2px solid #E2E8F0"}
          padding={puppy.picture?.url ? 0 : "15px"}
          src={puppy.picture?.url || "/default-puppy-img.jpg"}
          alt={`${puppy.name} - ${puppy.breed}`}
          cursor="pointer"
          onClick={() => navigate(`/puppy/${puppy.id}`)}
        />
        <Text>Name: {puppy.name}</Text>
        <Text mt="-10px">
          Breed: {puppy.breed.charAt(0).toUpperCase() + puppy.breed.slice(1)}
        </Text>
        <Button
          bg={theme.colors.primary}
          borderRadius={15}
          w="70%"
          h="60px"
          fontSize={18}
          fontWeight={600}
          colorScheme="yellow"
          onClick={() => navigate(`/puppy/${puppy.id}`)}
        >
          Apply for Puppy
        </Button>
      </VStack>
    );
  };

  return (
    <>
      <Header authorizedRole="all" bg="#F2F2F2" />
      <Heading my={8} textAlign="center">
        Pet Available For Adoption
      </Heading>

      <Flex mb="30px">
        <Spacer />
        <Text fontSize="lg" fontWeight="bold" w="180px" lineHeight="40px">
          Search for a puppy
        </Text>
        <Input
          type="text"
          w="300px"
          mr="10px"
          placeholder="Search by name or breed"
          focusBorderColor={theme.colors.primary}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          w="150px"
          mr="25px"
          placeholder="Status - All"
          onChange={(e) => {
            setStatus(e.target.value);
          }}
        >
          <option value="Available">Available</option>
          <option value="Reserved">Reserved</option>
          <option value="Adopted">Adopted</option>
        </Select>
      </Flex>

      {puppyList.length === 0 && (
        <Heading size="md" textAlign="center">
          No puppy found
        </Heading>
      )}

      <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4} mb="40px">
        {puppyList.map((puppy) => renderPuppy(puppy))}
      </SimpleGrid>
      <Footer currentPage="dogs" />
    </>
  );
};

export const query = graphql`
  query {
    allPuppy(
      sort: { created_at: DESC }
      filter: { status: { ne: "Unlisted" } }
    ) {
      nodes {
        id
        name
        breed
        picture {
          url
        }
        status
      }
    }
  }
`;

export const Head = () => <Seo title="Dogs for Adoption" />;

export default DogsPage;
