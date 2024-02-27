require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});
const firebaseCredentials = JSON.parse(process.env.FIREBASE_CREDENTIALS);

module.exports = {
  siteMetadata: {
    title: "Pawtner",
    titleTemplate: "%s | Pawtner",
    description: "Find your perfect pawtner",
    url: "https://pawtner.com",
    image: "/paws.png",
  },
  plugins: [
    "@chakra-ui/gatsby-plugin",
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-omni-font-loader",
      options: {
        enableListener: true,
        preconnect: [
          "https://fonts.googleapis.com",
          "https://fonts.gstatic.com",
        ],
        web: [
          {
            name: "Plus Jakarta Sans",
            file: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
            weights: ["400", "500", "600", "700"],
          },
          {
            name: "Inter",
            file: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap",
            weights: ["400", "500", "700"],
          },
          {
            name: "Poppins",
            file: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;800&display=swap",
            weights: ["400", "500", "600", "800"],
          },
          {
            name: "Sniglet",
            file: "https://fonts.googleapis.com/css2?family=Sniglet&display=swap",
            weights: ["400"],
          },
          {
            name: "Montserrat",
            file: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap",
            weights: ["400", "600", "700"],
          },
        ],
      },
    },
    {
      resolve: "gatsby-plugin-react-svg",
      options: {
        rule: {
          include: /\.inline\.svg$/,
        },
      },
    },
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/icon.png",
      },
    },
    {
      resolve: `gatsby-source-firestore-easy`,
      options: {
        adminCredential: {
          credential: firebaseCredentials,
          databaseURL: process.env.FIREBASE_DATABASE_URL,
        },
        collections: [
          {
            collection: "puppy",
            type: "Puppy",
          },
          {
            collection: "favorite",
            type: "Favorite",
          },
        ],
      },
    },
  ],
  flags: {
    DEV_SSR: true,
  },
};
