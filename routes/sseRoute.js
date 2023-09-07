import express from "express";
import SSE from "express-sse";

const router = express.Router();
export const sse = new SSE();

router.get("/stream", (req, res) => {
  sse.init(req, res);
});

export default router;
