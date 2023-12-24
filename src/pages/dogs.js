import { graphql, navigate } from "gatsby";
import React, { useEffect, useState } from "react";
import { Button, Heading, Image, SimpleGrid, VStack } from "@chakra-ui/react";
import theme from "../theme";
import Header from "../components/header";
import Footer from "../components/footer";
import Seo from "../components/seo";

const DogsPage = ({ data, location }) => {
  const [puppyList, setPuppyList] = useState(data.allPuppy.nodes);
  const search = new URLSearchParams(location.search).get("search") || "";

  useEffect(() => {
    if (search) {
      setPuppyList(
        puppyList.filter(
          (puppy) =>
            puppy.name.toLowerCase().includes(search.toLowerCase()) ||
            puppy.breed.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search]);

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
      sort: { created_at: ASC }
      filter: { status: { ne: "Unlisted" } }
    ) {
      nodes {
        id
        name
        breed
        picture {
          url
        }
      }
    }
  }
`;

export const Head = () => <Seo title="Dogs for Adoption" />;

export default DogsPage;
