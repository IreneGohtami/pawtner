import { graphql, navigate } from "gatsby";
import React from "react";
import { Button, Heading, Image, SimpleGrid, VStack } from "@chakra-ui/react";
import theme from "../theme";
import Header from "../components/header";
import Footer from "../components/footer";
import Seo from "../components/seo";

const DogsPage = ({ data }) => {
  const puppyList = data.allPuppy.nodes;
  console.log(puppyList, "puupyList");

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
      sort: { fields: created_at, order: ASC }
      filter: { status: { eq: "Available" } }
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
