export const VALID_USERS = [
  { email: "admin@aurawatt.in", password: "Admin@123", name: "Ansh", role: "Admin" },
  { email: "Accountsdept@avavbusiness.com", password: "Accounts@123", name: "Accounts Team", role: "Inventory Manager" },
  { email: "inventory@avavbusiness.com", password: "Inventory@123", name: "Inventory Team", role: "Inventory Manager" },
  { email: "sales@avavbusiness.com", password: "Sales@123", name: "Sales Team", role: "Sales Manager" },
  { email: "h2solar08@gmail.com", password: "H2Solar@123", name: "H2 Solar", role: "Distributor" },
] as const;

export type ValidUser = (typeof VALID_USERS)[number];

