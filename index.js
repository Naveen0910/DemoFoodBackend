import path from "path";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/order.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import sseRoutes from "./routes/sseRoute.js";
import compression from "compression";

dotenv.config(); // To load env variables from .env file
const app = express();
app.use(morgan("dev")); // this logs the route that we hit
app.use(cors());
app.use(compression());
// Connection with Database using LocalHost -- Lokesh

// const url = 'mongodb://localhost/FS2';

// mongoose.connect(url, { useNewUrlParser: true });
// const con = mongoose.connection;

// con.on('open', () => {
//   console.log('connected...');
// });

app.use(express.json());
app.use("/food", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use(sseRoutes);

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// app.listen(9000, () => {
//   console.log("Server started");
// });

// Connection with Database using MongoAtlas -- Naveen
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        `Server Started at PORT - ${process.env.PORT}, Connection to Database Done`
      );
    });
  })
  .catch((error) => {
    console.log(`Error Connecting to Database : ${error}`);
  });
