import { createContext, useContext, useState, ReactNode } from "react";

type NavigationOverlayContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const NavigationOverlayContext =
  createContext<NavigationOverlayContextType | null>(null);

export function NavigationOverlayProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <NavigationOverlayContext.Provider
      value={{ isOpen, open, close, toggle }}
    >
      {children}
    </NavigationOverlayContext.Provider>
  );
}

export function useNavigationOverlay() {
  const context = useContext(NavigationOverlayContext);

  if (!context) {
    throw new Error(
      "useNavigationOverlay must be used within NavigationOverlayProvider"
    );
  }

  return context;
}
