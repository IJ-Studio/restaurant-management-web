import React from "react";
import Image from "next/image";

import type { CartItem } from "../types";
import { X } from "../icons";

type Props = {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  onRemove: (id: number) => void;
  onAdd: (item: CartItem) => void;
};

export default function CartDrawer({
  open,
  onClose,
  cart,
  cartCount,
  cartTotal,
  onRemove,
  onAdd,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#161616] h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
          <h2 className="text-xl font-black">
            Mi Pedido <span className="text-orange-500">({cartCount})</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors"
          >
            <X />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <div className="text-5xl mb-4">🍽️</div>
              <p className="font-medium">Tu pedido está vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-2xl"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{item.name}</p>
                  <p className="text-orange-500 font-black">{item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRemove(item.id)}
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#2a2a2a] font-black text-lg flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors"
                  >
                    −
                  </button>
                  <span className="font-black w-4 text-center">{item.qty}</span>
                  <button
                    onClick={() => onAdd(item)}
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#2a2a2a] font-black text-lg flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-6 border-t border-black/5 dark:border-white/5">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Subtotal</span>
              <span>${cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-black text-lg mb-6">
              <span>Total</span>
              <span className="text-orange-500">
                $
                {(cartTotal * 1.16).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-orange-500/30">
              Confirmar Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

