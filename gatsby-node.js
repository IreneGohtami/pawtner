exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions;

  const result = await graphql(`
    query {
      allPuppy {
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
};
