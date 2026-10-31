import type { ReactNode } from "react";

export interface NavItem {
  key:      string;
  label:    string;
  icon:     ReactNode;
  href?:    string;
  /** Nested children — renders as a collapsible group */
  children?: NavItem[];
}

export interface SidebarSection {
  label:    string;
  items:    NavItem[];
}
