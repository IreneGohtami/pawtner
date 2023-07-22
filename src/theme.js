import { extendTheme } from "@chakra-ui/react";
const theme = {
  colors: {
    primary: "#fee8a0", //pawtner yellow
    black: {
      800: "#344054 !important",
    },
    gray: {
      600: "#667085 !important",
    },
    purple: {
      500: "#5429FF !important",
    },
  },
  fonts: {
    body: "'Plus Jakarta Sans', Helvetica, sans-serif !important",
  },
};

export default extendTheme(theme);
