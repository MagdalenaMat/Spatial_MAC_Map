const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

require("dotenv").config();
const admin = require("firebase-admin");

const express = require("express");
const cors = require("cors");

var { graphqlHTTP } = require("express-graphql");
var { buildSchema } = require("graphql");

const isEmulator = Boolean(process.env.FUNCTIONS_EMULATOR);
const serviceAccount = isEmulator ? require("./firebase-key.json") : null;

admin.initializeApp({
    credential: isEmulator
      ? admin.credential.cert(serviceAccount)
      : admin.credential.applicationDefault(),
  });

const getAllSlides = require("./modules/getAllSlides");
const saveSlideDetails = require("./modules/saveSlideDetails");

const app = express();
app.disable("x-powered-by");
app.use(cors());

const runtimeOpts = {
  timeoutSeconds: 5,
  memory: "256MB",
  maxInstances: 50,
};

app.use((req, res, next) => {
  const authHeader = req.headers.authorization;

  logger.info("Hello, is emulator", isEmulator);

  if (isEmulator) {
      req.isAdmin = true;
      return next();
  }

  if (!authHeader) {
      req.isAdmin = false;
      return next();
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== "Bearer") {
      req.isAdmin = false;
      return next();
  }

  req.token = parts[1];

  if (req.token == process.env.API_TOKEN) {
      req.isAdmin = true;
  } else {
      req.isAdmin = false;
  }
  
  next(); 
});


var schema = buildSchema(`
  type SlideAnnotation {
    name: String
    description: String
    x: Float
    y: Float
    number: Int
  }
  type SlideDescription {
    description: String
    annotations: [SlideAnnotation]
  }
  type Slide {
    name: String
    folder: String
    dzi: String
    details: SlideDescription
  }

  input SlideAnnotationInput {
    name: String
    description: String
    x: Float
    y: Float
    number: Int
  }

  input SlideDescriptionInput {
    dzi: String
    description: String
    annotations: [SlideAnnotationInput]
  }

  type Query {
    getAllSlides: [Slide]
    saveSlideDetails(details: SlideDescriptionInput!): String
  }
`);

var root = {
    getAllSlides: async (args, context) => {
      return await getAllSlides();
    },
    saveSlideDetails: async (args, context) => {
      if (!context.isAdmin) {
        return "unauthorized";
      }
      return await saveSlideDetails(args.details);
    }
  };

app.use(
    "/graphql",
    graphqlHTTP((request, response, graphQLParams) => ({
      schema: schema,
      rootValue: root,
      graphiql: isEmulator,
      context: { isAdmin: request.isAdmin },
    }))
  );

exports.api = onRequest(runtimeOpts, app);