import React from "react";
import { Flex, Link, Text, VStack } from "@chakra-ui/react";

import { PhoneTwoTone, MailTwoTone } from "@ant-design/icons";

const Footer = ({ currentPage }) => {
  const applyCurrentPageStyle = (page) => {
    return currentPage === page
      ? { color: "#E44652", fontWeight: 700 }
      : { color: "#000000" };
  };

  return (
    <Flex bg="#FEE8A0" p="60px" fontFamily="Montserrat !important">
      <VStack flex="1" alignItems="start">
        <Text fontSize={20} fontFamily="Sniglet !important">
          Your Own Pets Factory
        </Text>
        <Text mt="20px" maxW="250px">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam,
          purus sit
        </Text>
      </VStack>

      <VStack w="22%" alignItems="start">
        <Text fontSize={20} fontFamily="Sniglet !important">
          About us
        </Text>

        <Link mt="20px" href="/" {...applyCurrentPageStyle("home")}>
          Home
        </Link>
        <Link>About Us</Link>
        <Link>Service</Link>
        <Link>Shop Products</Link>
        <Link>Gallery</Link>
        <Link>Events</Link>
      </VStack>

      <VStack w="22%" alignItems="start">
        <Text fontSize={20} fontFamily="Sniglet !important">
          Collections
        </Text>
        <Link mt="20px" href="/dogs" {...applyCurrentPageStyle("dogs")}>
          Dogs
        </Link>
      </VStack>

      <VStack w="23%" alignItems="start">
        <Text fontSize={20} fontFamily="Sniglet !important">
          Contact Information
        </Text>
        <Text mt="20px">Street Panyanggar, Miles, USA</Text>
        <Text fontWeight={600}>
          <PhoneTwoTone twoToneColor="red" />
          &nbsp; 0878-1263-9283
        </Text>
        <Text fontWeight={600}>
          <MailTwoTone twoToneColor="red" />
          &nbsp; info@domain.com
        </Text>
      </VStack>
    </Flex>
  );
};

export default Footer;
