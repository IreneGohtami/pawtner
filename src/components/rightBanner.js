import React from "react";
import { StaticImage } from "gatsby-plugin-image";
import { Box, Center, Hide, useTheme } from "@chakra-ui/react";

const RightBanner = () => {
  const theme = useTheme();
  return (
    <Hide below="md">
      <Box bg={theme.colors.primary} borderRadius={40} w="100%" minH="600px">
        <Center pt={20}>
          <StaticImage src="../images/puppy.png" w={[400, 500, 600]} alt="" />
        </Center>
      </Box>
    </Hide>
  );
};

export default RightBanner;
