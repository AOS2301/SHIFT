import { Request, Response } from "express";
import { cartService } from "../service/carrinho.service";
import { handleError } from "../lib/handleError";

export async function getCart(req: Request, res: Response) {
  try {
    res.json(await cartService.get(req.userId!));
  } catch (error) {
    handleError(error, res);
  }
}

export async function addCartItem(req: Request, res: Response) {
  try {
    res.status(201).json(await cartService.add(req.userId!, req.body ?? {}));
  } catch (error) {
    handleError(error, res);
  }
}

export async function syncCart(req: Request, res: Response) {
  try {
    res.json(await cartService.sync(req.userId!, req.body ?? {}));
  } catch (error) {
    handleError(error, res);
  }
}

export async function updateCartItem(req: Request, res: Response) {
  try {
    res.json(
      await cartService.update(req.userId!, String(req.params.variantId), req.body ?? {})
    );
  } catch (error) {
    handleError(error, res);
  }
}

export async function removeCartItem(req: Request, res: Response) {
  try {
    res.json(await cartService.remove(req.userId!, String(req.params.variantId)));
  } catch (error) {
    handleError(error, res);
  }
}

export async function clearCart(req: Request, res: Response) {
  try {
    res.json(await cartService.clear(req.userId!));
  } catch (error) {
    handleError(error, res);
  }
}
