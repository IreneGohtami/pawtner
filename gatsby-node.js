exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions;

  const result = await graphql(`
    query {
      allPuppy {
        nodes {
          id
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
};
