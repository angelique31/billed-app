import LoginUI from "../views/LoginUI.js";
import BillsUI from "../views/BillsUI.js";
import NewBillUI from "../views/NewBillUI.js";
import DashboardUI from "../views/DashboardUI.js";

export const ROUTES_PATH = {
  Login: "/",
  Bills: "#employee/bills",
  NewBill: "#employee/bill/new",
  Dashboard: "#admin/dashboard",
};

export const ROUTES = ({ pathname, data, error, loading }) => {
  switch (pathname) {
    //page de connexion '/':
    case ROUTES_PATH["Login"]:
      return LoginUI({ data, error, loading });
    //page des factures '#employee/bills', c'est à dire l'interface utilisateur des factures
    case ROUTES_PATH["Bills"]:
      return BillsUI({ data, error, loading });
    //page de création de facture '#employee/bill/new' :
    case ROUTES_PATH["NewBill"]:
      return NewBillUI();
    //page de tableau de bord administrateur '#admin/dashboard':
    case ROUTES_PATH["Dashboard"]:
      return DashboardUI({ data, error, loading });
    default:
      return LoginUI({ data, error, loading });
  }
};
