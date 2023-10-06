import axios from "axios";
import React, { useState } from "react";
import { navigate } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Flex, Container, Text, Wrap, useTheme } from "@chakra-ui/react";
import { setCookie } from "../../cookie-manager";
import CustomSpinner from "../spinner";
import { ellipse, h1, overlapGroup } from "./select-option.module.css";

const SelectOptionPage = ({ onClose }) => {
  const theme = useTheme();
  const { isAuthenticated, user } = useAuth0();
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelection = async (role) => {
    setIsLoading(true);
    // Update user's role using Auth0 Management API
    if (isAuthenticated && user) {
      await axios.post("/api/auth0", {
        action: "update_user_role",
        userId: user.sub,
        role,
      });
      setCookie(`role|${user.email}`, JSON.stringify([role]), 1);
    }

    setIsLoading(false);
    if (role === "breeder") {
      navigate("/account/breeder-profile");
    }
    onClose();
  };

  return (
    <Container centerContent>
      <Box
        bg={theme.colors.primary}
        borderRadius={40}
        w={[450, 500, 700, 900, 1200, 1500]}
        minH="530px"
      >
        {isLoading ? (
          <CustomSpinner height="530px" />
        ) : (
          <>
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
          </>
        )}
      </Box>
    </Container>
  );
};

export default SelectOptionPage;
