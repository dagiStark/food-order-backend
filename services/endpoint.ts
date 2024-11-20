import express, { Application, Request, Response, NextFunction } from "express";
import path from "path";

import {
  AdminRoute,
  CustomerRoute,
  DeliveryRoute,
  ShoppingRoute,
  VandorRoute,
} from "../routes";

export const createEndpoint = (app: Application) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const imagePath = path.join(__dirname, "../public/images");
  app.use("/images", express.static(imagePath));

  app.use("/admin", AdminRoute);
  app.use("/customer", CustomerRoute);
  app.use("/delivery", DeliveryRoute);
  app.use("/shopping", ShoppingRoute);
  app.use("/vandor", VandorRoute);

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).send("Not Found");
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send("Internal Server Error");
  });
};
