import type { ReactNode } from "react";

import {
  IconClipboardList,
  IconCog,
  IconCoins,
  IconDashboard,
  IconFactory,
  IconMessageCircle,
  IconTag,
  IconTruck,
  IconUser,
  IconUsers,
  IconWrench,
} from "../icons/Icons";

export const NAV: Array<{ id: string | null; label: string; icon: ReactNode; group: string | null }> = [
  { id: "dashboard", label: "Dashboard", icon: <IconDashboard size={18} />, group: null },
  { id: null, label: "ADMIN TASKS", icon: null, group: "header" },
  { id: "users", label: "Manage User Profiles", icon: <IconUser size={18} />, group: "admin" },
  { id: "role-management", label: "Role Management", icon: <IconCog size={18} />, group: "admin" },
  { id: "customers", label: "Manage Customers", icon: <IconUsers size={18} />, group: "admin" },
  { id: null, label: "INVENTORY", icon: null, group: "header" },
  { id: "serials", label: "Serial Management", icon: <IconTag size={18} />, group: "inventory" },
  { id: "products", label: "Manage Products", icon: <IconClipboardList size={18} />, group: "inventory" },
  { id: "rawmaterials", label: "Manage Raw Materials", icon: <IconWrench size={18} />, group: "inventory" },
  { id: "manufactured", label: "Manufactured Products", icon: <IconCog size={18} />, group: "inventory" },
  { id: null, label: "SALES", icon: null, group: "header" },
  { id: "sales", label: "Sales Data Entry", icon: <IconCoins size={18} />, group: "sales" },
  { id: null, label: "COMPLAINTS", icon: null, group: "header" },
  { id: "complaints-consumer", label: "Complaints: Consumer", icon: <IconMessageCircle size={18} />, group: "complaints" },
  { id: "complaints-supplier", label: "Complaints: Supplier", icon: <IconFactory size={18} />, group: "complaints" },
  { id: null, label: "DISTRIBUTORS", icon: null, group: "header" },
  { id: "distributors", label: "Distributors Detail", icon: <IconTruck size={18} />, group: "distributors" },
];
