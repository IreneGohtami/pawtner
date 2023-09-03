import React from "react";
import { navigate } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import {
  Button,
  Center,
  Grid,
  GridItem,
  HStack,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Modal,
  ModalOverlay,
  ModalContent,
  SimpleGrid,
  Square,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";

import Seo from "../../components/seo";
import FilterIcon from "../../images/icons/filter.inline.svg";
import SearchIcon from "../../images/icons/search.inline.svg";
import Header from "../../components/header";
import SelectOptionPage from "../../components/select-option";
import theme from "../../theme";

//import { searchBox, icon } from "./home.module.css";

const HomePage = ({ puppyList }) => {
  console.log(puppyList, "puppyList!");
  const { isOpen, onOpen, onClose } = useDisclosure();

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
        />
        <Button
          bg={theme.colors.primary}
          borderRadius={15}
          w="70%"
          h="60px"
          fontSize={18}
          fontWeight={600}
          colorScheme="yellow"
          onClick={() => viewPuppy(puppy.id)}
        >
          Apply for Puppy
        </Button>
      </VStack>
    );
  };

  const renderPuppyThumbnail = (puppy) => {
    return (
      <Image
        key={puppy.id}
        w={[30, 80, 125]}
        h={[30, 80, 125]}
        objectFit="cover"
        borderRadius="10px"
        src={puppy.picture?.url || "/default-puppy-img.jpg"}
        alt={`${puppy.name} - ${puppy.breed}`}
      />
    );
  };

  const viewPuppy = (id) => {
    navigate(`/puppy/${id}`);
  };

  return (
    <>
      <Modal isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <SelectOptionPage onClose={onClose} />
        </ModalContent>
      </Modal>
      <Grid templateAreas={`"header" "hero" "main"`}>
        <GridItem area="header" px="40px">
          <Header authorizedRole="all" openSelectOptionModal={onOpen} />
        </GridItem>
        <GridItem area="hero">
          <StaticImage
            style={{
              minHeight: 260,
              maxHeight: 558,
            }}
            layout="fullWidth"
            src={"./images/banner-1.png"}
            alt="hero"
          />
        </GridItem>
        <GridItem area="hero">
          <Center h={[100, 120, 150, 230]}>
            <HStack spacing="0px">
              <InputGroup>
                <InputLeftAddon
                  bg="white"
                  borderRadius="23px 0 0 23px"
                  children={
                    <Square
                      size={[30, 38, 50, 90]}
                      bg="gray.200"
                      borderRadius="9px"
                    >
                      <Icon
                        as={FilterIcon}
                        w={[18, 22, 27, 45]}
                        h={[18, 22, 27, 45]}
                      />
                    </Square>
                  }
                  h={[39, 50, 70, 120]}
                />
                <Input
                  placeholder="Search something here..."
                  size="lg"
                  bg="white"
                  focusBorderColor="transparent"
                  border={0}
                  h={[39, 50, 70, 120]}
                  w={[250, 350, 600, 750, 900, 1050]}
                  fontSize={[16, 20, 26, 33]}
                />
                <InputRightAddon
                  bg="white"
                  borderRadius="0 23px 23px 0"
                  children={
                    <Icon
                      as={SearchIcon}
                      w={[18, 22, 27, 45]}
                      h={[18, 22, 27, 45]}
                    />
                  }
                  h={[39, 50, 70, 120]}
                  pr={8}
                />
              </InputGroup>
            </HStack>
          </Center>
        </GridItem>
        <GridItem area="main" mb="80px">
          <VStack>
            <Text fontSize="40px" fontWeight={700} my={8}>
              Pet Available For Adoption
            </Text>
          </VStack>
          <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4}>
            {puppyList.map(
              (puppy, index) =>
                (index < 3 || puppyList.length <= 4) && renderPuppy(puppy)
            )}

            {puppyList.length > 4 && (
              <VStack>
                <Square
                  borderRadius="20px"
                  bg="#F1F1F1"
                  p="20px"
                  w={[150, 200, 250, 300]}
                  h={[150, 200, 250, 300]}
                >
                  <SimpleGrid columns={2} spacing={4}>
                    {puppyList.map(
                      (puppy, index) =>
                        index > 2 && index < 7 && renderPuppyThumbnail(puppy)
                    )}
                  </SimpleGrid>
                </Square>
                <Button
                  bg={theme.colors.primary}
                  borderRadius={15}
                  w="70%"
                  h="60px"
                  fontSize={25}
                  fontWeight={700}
                  colorScheme="yellow"
                  //onClick={viewMorePuppy}
                >
                  More
                </Button>
              </VStack>
            )}
          </SimpleGrid>
        </GridItem>
      </Grid>
    </>
  );
};

export const Head = () => <Seo title="Home" />;

export default HomePage;
