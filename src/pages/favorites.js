import { graphql, navigate } from "gatsby";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button, Heading, Image, SimpleGrid, VStack } from "@chakra-ui/react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import theme from "../theme";
import Header from "../components/header";
import Footer from "../components/footer";
import CustomSpinner from "../components/spinner";
import Seo from "../components/seo";

const FavoritesPage = ({ data = {} }) => {
  const { isAuthenticated, user } = useAuth0();
  const [puppyList, setPuppyList] = useState(data?.allPuppy?.nodes || []);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user favorites
  useEffect(() => {
    async function checkFavorite() {
      if (isAuthenticated && user) {
        setIsLoading(true);
        try {
          const q = query(
            collection(db, "favorite"),
            where("user_id", "==", user.sub)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const animalIds = querySnapshot.docs.map(
              (doc) => doc.data().animal_id
            );

            // Filter puppy that matches the animalIds
            const temp = data.allPuppy.nodes.filter((puppy) => {
              return animalIds.includes(puppy.id);
            });
            setPuppyList(temp);
          } else {
            setPuppyList([]);
          }
        } catch (e) {
          console.log(e, "error fetching favorites");
        }
      } else {
        setPuppyList([]);
      }
      setIsLoading(false);
    }
    checkFavorite();
  }, [isAuthenticated, user]);

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
        Favorites
      </Heading>
      {isLoading ? (
        <CustomSpinner />
      ) : (
        <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4} mb="40px">
          {puppyList.map((puppy) => renderPuppy(puppy))}
        </SimpleGrid>
      )}
      <Footer currentPage="favorites" />
    </>
  );
};

export const pageQuery = graphql`
  query {
    allPuppy {
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

export const Head = () => <Seo title="Favorites" />;

export default FavoritesPage;
