import type { ReactNode } from "react";

export interface NavItem {
  key:      string;
  label:    string;
  icon:     ReactNode;
  href?:    string;
  /** Subentradas: se muestran siempre debajo de su grupo, sin plegarse (D-29). */
  children?: NavItem[];
}

export interface SidebarSection {
  label:    string;
  items:    NavItem[];
}
