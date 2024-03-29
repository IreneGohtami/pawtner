const fs = require("fs");
const path = require("path");
const webpack = require("webpack");

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    plugins: [
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, "");
      }),
    ],
    resolve: {
      fallback: {
        stream: require.resolve("stream-browserify"), // Use stream-browserify as a polyfill
        emitter: require.resolve("emitter"),
        util: require.resolve("util/"),
      },
    },
  });
};

exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions;

  const result = await graphql(`
    query {
      allPuppy(filter: { status: { ne: "Unlisted" } }) {
        nodes {
          id
          owner_id
        }
      }
    }
  `);

  if (result.errors) {
    throw result.errors;
  }

  // Create a page for each puppy
  result.data.allPuppy.nodes.forEach(({ id }) => {
    createPage({
      path: `/puppy/${id}`,
      component: require.resolve("./src/templates/puppy-detail.js"),
      context: {
        // Pass the ID as context to the template
        id,
      },
    });
  });

  // Map breeder ids from owner_id
  const breederIds = [
    ...new Set(result.data.allPuppy.nodes.map((puppy) => puppy.owner_id)),
  ];
  // Create a page for each breeder
  breederIds.forEach((id) => {
    const userId = id.split("|").pop();
    createPage({
      path: `/breeder/${userId}`,
      component: require.resolve("./src/templates/breeder-detail.js"),
      context: {
        // Pass the ID as context to the template
        id,
      },
    });
  });

  // Generate XML sitemap
  const sitemap = generateSitemap(result.data.allPuppy.nodes, breederIds);

  // Save sitemap to static directory
  fs.writeFileSync(path.join(__dirname, "static", "sitemap.xml"), sitemap);
};

function generateSitemap(puppies, breederIds) {
  // Construct XML sitemap based on dynamic URLs
  let xml = '<?xml version="1.0" encoding="UTF-8"?>';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

  // Add homepage URL
  xml += "<url>";
  xml += "<loc>https://pawtner.ca</loc>";
  xml += "<lastmod>" + new Date().toISOString() + "</lastmod>";
  xml += "<changefreq>weekly</changefreq>";
  xml += "<priority>1.00</priority>";
  xml += "</url>";

  // Add dogs URL
  xml += "<url>";
  xml += "<loc>https://pawtner.ca/dogs</loc>";
  xml += "<lastmod>" + new Date().toISOString() + "</lastmod>";
  xml += "<changefreq>weekly</changefreq>";
  xml += "<priority>0.90</priority>";
  xml += "</url>";

  // Add about URL
  xml += "<url>";
  xml += "<loc>https://pawtner.ca/about</loc>";
  xml += "<lastmod>" + new Date().toISOString() + "</lastmod>";
  xml += "<changefreq>monthly</changefreq>";
  xml += "<priority>0.50</priority>";
  xml += "</url>";

  // Add faq URL
  xml += "<url>";
  xml += "<loc>https://pawtner.ca/faq</loc>";
  xml += "<lastmod>" + new Date().toISOString() + "</lastmod>";
  xml += "<changefreq>monthly</changefreq>";
  xml += "<priority>0.50</priority>";
  xml += "</url>";

  // Add privacy policy URL
  xml += "<url>";
  xml += "<loc>https://pawtner.ca/privacy-policy</loc>";
  xml += "<lastmod>" + new Date().toISOString() + "</lastmod>";
  xml += "<changefreq>monthly</changefreq>";
  xml += "<priority>0.50</priority>";
  xml += "</url>";

  // Add terms and conditions URL
  xml += "<url>";
  xml += "<loc>https://pawtner.ca/terms-and-conditions</loc>";
  xml += "<lastmod>" + new Date().toISOString() + "</lastmod>";
  xml += "<changefreq>monthly</changefreq>";
  xml += "<priority>0.50</priority>";
  xml += "</url>";

  // Add puppies URLs
  puppies.forEach((puppy) => {
    xml += "<url>";
    xml += `<loc>https://pawtner.ca/puppy/${puppy.id}</loc>`;
    xml += "<lastmod>" + new Date().toISOString() + "</lastmod>";
    xml += "<changefreq>monthly</changefreq>";
    xml += "<priority>0.80</priority>";
    xml += "</url>";
  });

  // Add breeders URLs
  breederIds.forEach((id) => {
    const userId = id.split("|").pop();
    xml += "<url>";
    xml += `<loc>https://pawtner.ca/breeder/${userId}</loc>`;
    xml += "<lastmod>" + new Date().toISOString() + "</lastmod>";
    xml += "<changefreq>monthly</changefreq>";
    xml += "<priority>0.70</priority>";
    xml += "</url>";
  });

  xml += "</urlset>";
  return xml;
}
