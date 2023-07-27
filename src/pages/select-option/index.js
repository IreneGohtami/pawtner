import React, { useState } from "react";
import { navigate } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import { useAuth0 } from "@auth0/auth0-react";
import {
  ChakraProvider,
  Box,
  Center,
  Flex,
  Container,
  Spinner,
  Text,
  Wrap,
} from "@chakra-ui/react";
import { updateUserRole } from "../../auth/update-user";
import Seo from "../../components/seo";
import PawtnerLogo from "../../images/logo.inline.svg";
import theme from "../../theme";
import { ellipse, h1, logo, overlapGroup } from "./select-option.module.css";

const SelectOptionPage = (props) => {
  const { isAuthenticated, user } = useAuth0();
  const [isLoading, setIsLoading] = useState(false);
  const { setDisplayHomepage } = props;

  const handleRoleSelection = async (role) => {
    setIsLoading(true);
    // Update user's role using Auth0 Management API
    if (isAuthenticated && user) {
      await updateUserRole(user.sub, role);
    }

    setIsLoading(false);
    if (setDisplayHomepage) {
      setDisplayHomepage(true);
    }

    // Redirect user back to homepage
    navigate("/");
  };

  const renderSpinner = () => {
    return (
      <Center h="100vh">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Center>
    );
  };

  return !isLoading ? (
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
            <Flex
              className={overlapGroup}
              direction="column"
              onClick={() => handleRoleSelection("buyer")}
            >
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
            <Flex
              className={overlapGroup}
              direction="column"
              onClick={() => handleRoleSelection("breeder")}
            >
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
  ) : (
    renderSpinner()
  );
};

export const Head = () => <Seo title="Select Option" />;

export default SelectOptionPage;
