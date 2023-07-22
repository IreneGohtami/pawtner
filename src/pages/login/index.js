import React from "react";
import { StaticImage } from "gatsby-plugin-image";
import {
  ChakraProvider,
  Box,
  Button,
  Center,
  Checkbox,
  Container,
  FormControl,
  FormLabel,
  Hide,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  SimpleGrid,
  Spacer,
  Text,
} from "@chakra-ui/react";
import Seo from "../../components/seo";
import PawtnerLogo from "../../images/logo.inline.svg";
import HideIcon from "../../images/icons/hide.inline.svg";
import XIcon from "../../images/icons/x.inline.svg";
import theme from "../../theme";
import { logo } from "./login.module.css";

const LoginPage = () => {
  return (
    <ChakraProvider theme={theme}>
      <PawtnerLogo className={logo} />
      <SimpleGrid columns={2} m={8} spacing={10}>
        <Box mt="7rem" fontFamily={"Inter !important"}>
          <Container w="380px">
            <Text fontSize={40} fontWeight={700} color="black.800">
              Log In
            </Text>
            <Text color="gray.600" pt={2} pb={10}>
              Please fill your detail to access your account.
            </Text>

            <FormControl>
              <FormLabel>Email</FormLabel>
              <InputGroup>
                <Input
                  type="email"
                  placeholder="debra.holt@example.com"
                  h="44px"
                />
                <InputRightElement
                  children={<Icon as={XIcon} w="24px" h="24px" />}
                  h="44px"
                />
              </InputGroup>
            </FormControl>
            <br />
            <FormControl>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input type="password" h="44px" />
                <InputRightElement
                  children={<Icon as={HideIcon} w="24px" h="24px" />}
                  h="44px"
                />
              </InputGroup>
            </FormControl>
            <br />
            <HStack>
              <Checkbox fontWeight={500}>Remember me</Checkbox>
              <Spacer />
              <Link color="purple.500" fontWeight={500}>
                Forgot Password?
              </Link>
            </HStack>
            <br />
            <Button
              bg={theme.colors.primary}
              variant="solid"
              w="100%"
              h="44px"
              borderRadius="8px"
              fontWeight={500}
            >
              Log in
            </Button>
          </Container>
        </Box>

        <Hide below="md">
          <Box
            bg={theme.colors.primary}
            borderRadius={40}
            w="100%"
            minH="600px"
          >
            <Center pt={20}>
              <StaticImage src="./images/puppy.png" w={[400, 500, 600]} />
            </Center>
          </Box>
        </Hide>
      </SimpleGrid>
    </ChakraProvider>
  );
};

export const Head = () => <Seo title="Login" />;

export default LoginPage;
