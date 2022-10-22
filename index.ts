import { ApolloServer, gql } from "apollo-server";
import * as fs from "fs";
import { setTimeout } from "timers/promises";
import { Query, Resolvers } from "./generated/graphql";

const typeDefs = gql`
  ${fs.readFileSync(__dirname.concat("/../schema.gql"), "utf8")}
`;

const readJsonFileSync = (relativeFileName: string): Query => {
  const jsonDataFile = __dirname.concat(relativeFileName);
  const fileContent = fs.readFileSync(jsonDataFile, "utf8");
  const jsonData = JSON.parse(fileContent);
  return jsonData;
};

// throws on error
const queryDataSync: Query = readJsonFileSync("/../data/Query.json");

// hack - see where it's used within Resolver for more detail
const useDefaultResolver: any = null;

const resolvers: Resolvers = {
  Query: {
    employees: async (_parent, _args, context, _info) => {
      console.log("waiting started");
      await setTimeout(3000, null);
      console.log("waiting ended");
      return queryDataSync.employees;
    },
  },
  // If we remove the `Employee` definition here, Apollo will use the default resolver at runtime which works fine, https://www.apollographql.com/docs/apollo-server/data/resolvers
  // however, TypeScript gives an error at compile time. So `useDefaultResolver` is a hack to avoid type errors using Apollo's default resolver
  // and GraphQL codegen's Resolvers type at the same time
  Employee: useDefaultResolver, //this will use Apollo's default resolver
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// The  method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at: ${url}`);
});
