import React from "react";
import Image from "next/image";

import type { Dish } from "../types";
import { Clock, Plus, Star, X } from "../icons";

type Props = {
  dish: Dish | null;
  onClose: () => void;
  onAddToCart: (dish: Dish) => void;
};

export default function DishModal({ dish, onClose, onAddToCart }: Props) {
  if (!dish) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#161616] rounded-[2.5rem] overflow-hidden max-w-lg w-full border border-black/10 dark:border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64">
          <Image src={dish.img} alt={dish.name} fill className="object-cover" />
          {dish.tag && (
            <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {dish.tag}
            </span>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/80 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-8">
          <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-1">
            {(dish.catIcon ? `${dish.catIcon} ` : "") + dish.catLabel}
          </p>
          <h3 className="text-2xl font-black mb-2">{dish.name}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span className="flex items-center gap-1">
              <Star size={14} fill className="text-yellow-500" /> {dish.rating}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} /> {dish.time}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
            {dish.desc}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-orange-500">
              {dish.price}
            </span>
            <button
              onClick={() => {
                onAddToCart(dish);
                onClose();
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-2xl font-black transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus size={18} /> Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

