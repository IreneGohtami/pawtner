import React from "react";
import { navigate } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import {
  Box,
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

import FilterIcon from "../../images/icons/filter.inline.svg";
import SearchIcon from "../../images/icons/search.inline.svg";
import Header from "../../components/header";
import Footer from "../../components/footer";
import SelectOptionPage from "../../components/select-option";
import theme from "../../theme";

import { title, subtitle, infoBox, learnMoreBtn } from "./home.module.css";

const HomePage = ({ puppyList = [] }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [search, setSearch] = React.useState("");

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

  const searchPuppy = () => {
    if (search) {
      navigate(`/dogs?search=${search}`);
    }
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
        <GridItem area="header">
          <Header authorizedRole="all" openSelectOptionModal={onOpen} />
        </GridItem>
        <GridItem area="hero">
          <StaticImage
            style={{
              minHeight: 260,
              maxHeight: 558,
            }}
            layout="fullWidth"
            src={"./images/banner2.jpg"}
            alt="hero"
          />
        </GridItem>
        <GridItem area="hero">
          <Center pt="3%">
            <VStack>
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
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        searchPuppy();
                      }
                    }}
                  />
                  <InputRightAddon
                    bg="white"
                    cursor="pointer"
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
                    onClick={searchPuppy}
                  />
                </InputGroup>
              </HStack>
              <Text
                mt={5}
                fontWeight={700}
                fontSize={38}
                zIndex={2}
                color="white"
                bg="rgba(51, 51, 51, 0.5)"
                px="15px"
                borderRadius={10}
              >
                Find your new best friend
              </Text>
              <Text
                fontSize={16}
                zIndex={2}
                color="white"
                bg="rgba(51, 51, 51, 0.5)"
                px="12px"
                borderRadius={5}
              >
                Browse pets from our network of reputable breeders
              </Text>
            </VStack>
          </Center>
        </GridItem>
        <GridItem area="main">
          <VStack>
            <Text className={title} my={8}>
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
                  onClick={() => navigate("/dogs")}
                >
                  More
                </Button>
              </VStack>
            )}
          </SimpleGrid>

          <Box mt="40px" p="40px" pb="60px" bg="#F8FAFF">
            <Text className={title}>Planning to Adopt a Pet?</Text>
            <HStack spacing={4} mt="20px">
              <Box className={infoBox}>
                <Box h="160px">
                  <Text className={subtitle}>About Us</Text>
                  <Text mt={4}>
                    Our mission and commitment, how it works, as well as data
                    security of this platform.
                  </Text>
                </Box>
                <Button
                  className={learnMoreBtn}
                  onClick={() => navigate("/about-us")}
                >
                  Learn More
                </Button>
              </Box>

              <Box className={infoBox}>
                <Box h="160px">
                  <Text className={subtitle}>Pet Adoption FAQs</Text>
                  <Text mt={4}>
                    Get answers to question you haven't thought of.
                  </Text>
                </Box>
                <Button
                  className={learnMoreBtn}
                  onClick={() => navigate("/faq")}
                >
                  Learn More
                </Button>
              </Box>

              <Box className={infoBox}>
                <Box h="160px">
                  <Text className={subtitle}>Privacy Policy</Text>
                  <Text mt={4}>
                    Read through our guidelines to ensure your data is safe with
                    us.
                  </Text>
                </Box>
                <Button
                  className={learnMoreBtn}
                  onClick={() => navigate("/privacy-policy")}
                >
                  Learn More
                </Button>
              </Box>
            </HStack>
          </Box>

          <Footer currentPage="home" />
        </GridItem>
      </Grid>
    </>
  );
};

export default HomePage;
