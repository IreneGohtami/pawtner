import React from "react";
import { StaticImage } from "gatsby-plugin-image";
import {
  ChakraProvider,
  Box,
  Flex,
  Container,
  Text,
  Wrap,
} from "@chakra-ui/react";
import Seo from "../../components/seo";
import PawtnerLogo from "../../images/logo.inline.svg";
import theme from "../../theme";
import { ellipse, h1, logo, overlapGroup } from "./select-option.module.css";

const SelectOptionPage = () => {
  return (
    <ChakraProvider theme={theme}>
      <Container maxW="2xl" centerContent>
        <PawtnerLogo className={logo} />
        <Box
          bg={theme.colors.primary}
          borderRadius={40}
          mt={119}
          w={[450, 500, 700, 900, 1200, 1500]}
          minH="530px"
        >
          <Text
            className={h1}
            fontSize={{ base: "30px", md: "36px", lg: "43px" }}
          >
            Select Option
          </Text>
          <Wrap
            justify="center"
            spacing={{ base: "20px", md: "60px", lg: "80px" }}
          >
            <Flex className={overlapGroup} direction="column">
              <StaticImage
                className={ellipse}
                alt="Buyer"
                src="./images/buyer.png"
              />
              <Text
                fontWeight={500}
                fontSize={{ base: "30px", md: "36px", lg: "43px" }}
              >
                Buyer
              </Text>
            </Flex>
            <Flex className={overlapGroup} direction="column">
              <StaticImage
                className={ellipse}
                alt="Breeders"
                src="./images/breeders.png"
              />
              <Text
                fontWeight={500}
                fontSize={{ base: "30px", md: "36px", lg: "43px" }}
              >
                Breeders
              </Text>
            </Flex>
          </Wrap>
        </Box>
      </Container>
    </ChakraProvider>
  );
};

export const Head = () => <Seo title="Select Option" />;

export default SelectOptionPage;
