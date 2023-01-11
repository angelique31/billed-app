/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../../views/BillsUI.js";
import { bills } from "../../fixtures/bills.js";
import { ROUTES_PATH } from "../../constants/routes.js";
import { localStorageMock } from "../../__mocks__/localStorage.js";

import router from "../../app/Router.js";

//On décrit le contexte :
//mettre "containers/Bills" à la place de  "Given I am connected as an employee"
describe("Given I am connected as an employee", () => {
  //On décrit l'action que l'on test :
  describe("When I am on Bills Page", () => {
    //Message indiquant le résultat attendu :
    //Ensuite, l'icône de la facture dans la disposition verticale doit être mise en surbrillance
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        // simuler les comportements de localStorage avec le mock :
        value: localStorageMock,
      });
      //stocker les données de l'utilisateur :
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router(); //fonction utilisée pour configurer les différentes routes de l'application et de gérer les changements d'URL.
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window")); //attendre que l'élément ayant un id "icon-window" soit disponible avant de continuer.
      const windowIcon = screen.getByTestId("icon-window"); //stock l'élément récupéré dans une variable
      // console.log(windowIcon);
      //to-do write expect expression
      //vérifier si l'icône de la facture est mise en surbrillance :
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    //Ensuite, les factures doivent être commandées de la + récente à la + ancienne
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

//Ajouter 6 ou 7 tests sur ce fichier
