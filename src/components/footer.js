import React from "react";
import { Flex, IconButton, Link, Text, VStack } from "@chakra-ui/react";
import { MailTwoTone } from "@ant-design/icons";

const pawtnerEmail = "contact@pawtner.ca";
const Footer = ({ currentPage }) => {
  const applyCurrentPageStyle = (page) => {
    return currentPage === page
      ? { color: "#E44652", fontWeight: 700 }
      : { color: "#000000" };
  };

  const handleEmailButtonClick = () => {
    window.location.href = `mailto:${pawtnerEmail}`;
  };

  return (
    <Flex bg="#FEE8A0" p="60px" fontFamily="Montserrat !important">
      <VStack flex="1" alignItems="start" pr="50px">
        <Text fontSize={20} fontFamily="Sniglet !important">
          Finding the right partner has never been easier
        </Text>
        <Text mt="20px">
          At Pawtner, we understand the challenges of finding the perfect furry
          companion, and we've crafted a platform to simplify and streamline the
          process.
        </Text>
      </VStack>

      <VStack w="22%" alignItems="start">
        <Text fontSize={20} fontFamily="Sniglet !important">
          About us
        </Text>

        <Link mt="20px" href="/" {...applyCurrentPageStyle("home")}>
          Home
        </Link>
        <Link href="/about-us" {...applyCurrentPageStyle("about-us")}>
          About Us
        </Link>
        <Link href="/faq" {...applyCurrentPageStyle("faq")}>
          FAQ
        </Link>
        <Link
          href="/privacy-policy"
          {...applyCurrentPageStyle("privacy-policy")}
        >
          Privacy Policy
        </Link>
        <Link
          href="/terms-and-conditions"
          {...applyCurrentPageStyle("terms-and-conditions")}
        >
          Terms & Conditions
        </Link>
      </VStack>

      <VStack w="22%" alignItems="start">
        <Text fontSize={20} fontFamily="Sniglet !important">
          Collections
        </Text>
        <Link mt="20px" href="/dogs" {...applyCurrentPageStyle("dogs")}>
          Dogs
        </Link>
      </VStack>

      <VStack w="22%" alignItems="start">
        <Text fontSize={20} fontFamily="Sniglet !important">
          Contact Information
        </Text>
        <Text fontWeight={600} ml="-10px">
          <IconButton
            icon={<MailTwoTone twoToneColor="red" />}
            fontSize="18px"
            colorScheme="transparent"
            onClick={handleEmailButtonClick}
          />
          <a href={`mailto:${pawtnerEmail}`}>{pawtnerEmail}</a>
        </Text>
      </VStack>
    </Flex>
  );
};

export default Footer;
