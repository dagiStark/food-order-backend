import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./services/database";
import { createEndpoint } from "./services/endpoint";

const app = express();

app.use(bodyParser.json());
app.use(cors());

createEndpoint(app);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

connectDB().then(() => {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
});
