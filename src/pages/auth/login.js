import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  ChakraProvider,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormLabel,
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
import RightBanner from "../../components/rightBanner";
import PawtnerLogo from "../../images/logo.inline.svg";
import HideIcon from "../../images/icons/hide.inline.svg";
import XIcon from "../../images/icons/x.inline.svg";
import theme from "../../theme";
import { logo } from "./auth.module.css";

const LoginPage = () => {
  const { loginWithRedirect } = useAuth0();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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

            <FormControl id="username">
              <FormLabel>Email</FormLabel>
              <InputGroup>
                <Input
                  type="email"
                  placeholder="debra.holt@example.com"
                  h="44px"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <InputRightElement
                  children={<Icon as={XIcon} w="24px" h="24px" />}
                  h="44px"
                />
              </InputGroup>
            </FormControl>
            <br />
            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type="password"
                  h="44px"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
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
              onClick={loginWithRedirect}
            >
              Log in
            </Button>
          </Container>
        </Box>

        <RightBanner />
      </SimpleGrid>
    </ChakraProvider>
  );
};

export const Head = () => <Seo title="Login" />;

export default LoginPage;
