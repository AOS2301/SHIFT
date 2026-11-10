import { Request, Response } from "express";
import { orderService } from "../service/pedido.service";
import { handleError } from "../lib/handleError";

export async function checkout(req: Request, res: Response) {
  try {
    res.status(201).json(await orderService.checkout(req.userId!));
  } catch (error) {
    handleError(error, res);
  }
}

export async function listOrders(req: Request, res: Response) {
  try {
    res.json(await orderService.list(req.userId!));
  } catch (error) {
    handleError(error, res);
  }
}

export async function getOrderById(req: Request, res: Response) {
  try {
    res.json(await orderService.getById(req.userId!, String(req.params.id)));
  } catch (error) {
    handleError(error, res);
  }
}
