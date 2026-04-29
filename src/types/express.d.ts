import "express";

declare module "express" {
  interface Request {
    query: any;
    body: any;
    params: any;
    user?: any;
  }
}
