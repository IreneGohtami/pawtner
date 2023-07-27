import React, { useEffect, useState } from "react";
import { StaticImage } from "gatsby-plugin-image";
import { useAuth0 } from "@auth0/auth0-react";
import {
  useTheme,
  Box,
  Center,
  Grid,
  GridItem,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Square,
  Text,
} from "@chakra-ui/react";
import Seo from "../../components/seo";
import FilterIcon from "../../images/icons/filter.inline.svg";
import SearchIcon from "../../images/icons/search.inline.svg";
import Header from "../../components/header";
import SelectOptionPage from "../select-option";

//import { searchBox, icon } from "./home.module.css";

const HomePage = () => {
  //const theme = useTheme();
  const { isAuthenticated, user } = useAuth0();
  const [displayHomepage, setDisplayHomepage] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      const roles = user?.["https://pawtner.gatsbyjs.io/roles"] || [];
      console.log(user, roles, "user");
      if (!roles.length) {
        setDisplayHomepage(false);
      }
    }
  }, [isAuthenticated, user]);

  return displayHomepage ? (
    <Grid templateAreas={`"header" "hero" "main"`}>
      <GridItem area="header" px="40px">
        <Header />
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
      <GridItem area="main">
        <Center h={150}>
          <Text fontSize="40px" fontWeight={700}>
            Pet Available For Adoption
          </Text>
        </Center>
      </GridItem>
    </Grid>
  ) : (
    <SelectOptionPage />
  );
};

export const Head = () => <Seo title="Home" />;

export default HomePage;
