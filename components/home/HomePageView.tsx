'use client';

import React from "react";

import type { CartItem, CategoryKey, Combo, Dish, MenuCategory, Promo, ReservaData } from "./types";
import AboutSection from "./sections/AboutSection";
import CartDrawer from "./sections/CartDrawer";
import CategoriesSection from "./sections/CategoriesSection";
import DishModal from "./sections/DishModal";
import Footer from "./sections/Footer";
import HeroSection from "./sections/HeroSection";
import MenuSection from "./sections/MenuSection";
import Navbar from "./sections/Navbar";
import PackagesSection from "./sections/PackagesSection";
import PromotionsSection from "./sections/PromotionsSection";
import ReservaSection from "./sections/ReservaSection";
import Toast from "./sections/Toast";

type Props = {
  theme: string | undefined;
  setTheme: (theme: string) => void;

  toast: string | null;

  selectedDish: Dish | null;
  setSelectedDish: (dish: Dish | null) => void;

  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  cartCount: number;
  cartTotal: number;

  addToCart: (dish: Dish) => void;
  removeFromCart: (id: number) => void;

  PROMOS: Promo[];
  promoIndex: number;
  setPromoIndex: (idx: number) => void;
  promoRef: React.RefObject<HTMLDivElement>;
  handlePromoPrev: () => void;
  handlePromoNext: () => void;
  combos: Combo[];

  dishes: Dish[];
  categories: MenuCategory[];
  activeCategory: CategoryKey;
  setActiveCategory: (key: CategoryKey) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  filteredDishes: Dish[];
  totalInPool: number;
  visibleCount: number;
  setVisibleCount: React.Dispatch<React.SetStateAction<number>>;
  canShowMore: boolean;
  MENU_PAGE_SIZE: number;

  reservaData: ReservaData;
  setReservaData: React.Dispatch<React.SetStateAction<ReservaData>>;
  reservaOk: boolean;
  handleReserva: (e: React.FormEvent) => void;
};

export default function HomePageView(props: Props) {
  const {
    theme,
    setTheme,
    toast,
    selectedDish,
    setSelectedDish,
    cart,
    cartOpen,
    setCartOpen,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    PROMOS,
    promoIndex,
    setPromoIndex,
    promoRef,
    handlePromoPrev,
    handlePromoNext,
    combos,
    dishes,
    categories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    filteredDishes,
    totalInPool,
    visibleCount,
    setVisibleCount,
    canShowMore,
    MENU_PAGE_SIZE,
    reservaData,
    setReservaData,
    reservaOk,
    handleReserva,
  } = props;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-black dark:text-white transition-colors duration-500 selection:bg-orange-500/30">
      <Toast toast={toast} />

      <DishModal
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        onAddToCart={addToCart}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onRemove={removeFromCart}
        onAdd={(item: CartItem) => addToCart(item)}
      />

      <Navbar
        theme={theme}
        setTheme={setTheme}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
      />

      <HeroSection />

      <CategoriesSection
        categories={categories}
        dishes={dishes}
        onSelectCategory={setActiveCategory}
      />

      <PromotionsSection
        PROMOS={PROMOS}
        promoIndex={promoIndex}
        setPromoIndex={setPromoIndex}
        promoRef={promoRef}
        handlePromoPrev={handlePromoPrev}
        handlePromoNext={handlePromoNext}
      />

      <PackagesSection combos={combos} />

      <MenuSection
        dishes={dishes}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredDishes={filteredDishes}
        totalInPool={totalInPool}
        visibleCount={visibleCount}
        setVisibleCount={setVisibleCount}
        canShowMore={canShowMore}
        MENU_PAGE_SIZE={MENU_PAGE_SIZE}
        onSelectDish={setSelectedDish}
        onAddToCart={addToCart}
      />

      <AboutSection />

      <ReservaSection
        reservaData={reservaData}
        setReservaData={setReservaData}
        reservaOk={reservaOk}
        handleReserva={handleReserva}
      />

      <Footer />
    </div>
  );
}
