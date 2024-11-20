import express, { Router, Request, Response, NextFunction } from "express";
const router: Router = express.Router();

router.post("/vendor");
router.post("/vendors");
router.post("/vendor/:id");

router.post("/transactions");
router.post("/transaction/:id");

router.post("/delivery/verify");
router.post("/delivery/users");

router.get("/", (req: Request, res: Response) => {
  res.send("Hello from Admin");
});

export default router;
