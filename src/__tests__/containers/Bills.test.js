/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

import BillsUI from "../../views/BillsUI";
import { bills } from "../../fixtures/bills";
import { ROUTES, ROUTES_PATH } from "../../constants/routes";
import { localStorageMock } from "../../__mocks__/localStorage";
import mockStore from "../../__mocks__/store";
import Bills from "../../containers/Bills";
import router from "../../app/Router";

jest.mock("../../app/store", () => mockStore);

//On décrit le contexte :
//mettre "views/VerticalLayout" à la place de  "Given I am connected as an employee"
describe("views/VerticalLayout", () => {
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
      //vérifier si l'icône de la facture est mise en surbrillance :
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    //"Then bills should be ordered from earliest to latest"
    // Les factures doivent être commandées de la + récente à la + ancienne
    test("views/BillsUI", () => {
      // la fonction "BillsUI" contient les données de factures:
      document.body.innerHTML = BillsUI({ data: bills });
      //méthode "getAllByText" sélectionne tous les éléments de la page qui correspondent à un format de date spécifique avec une regexp
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        //fonction map pour stocker les dates (innerHTML) dans une variable
        .map((a) => a.innerHTML);
      //trier les données du plus récent au plus ancien
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      // "expect" pour vérifier que les données de factures (dates) sont triées de la manière attendue (datesSorted)
      expect(dates).toEqual(datesSorted);
    });
  });
});

/****************clique sur le bouton "nouvelle note de frais"************************************ */
//quand l'utilisateur clique sur le bouton "Nouvelle note de frais(NewBill)", la fonction handleClickNewBill est appelée, qui change l'URL de l'application pour afficher la page "Nouvelle facture" et que le contenu de cette page contient le texte "Envoyer une note de frais"
describe("When I click on the 'New Bill' button", () => {
  test("It should display the 'New Bill' page", () => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
    const html = BillsUI({ data: bills });
    document.body.innerHTML = html;

    //simule un changement de page dans l'application
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    // instance de la classe "Bills" utilisée pour gérer les factures et les interactions utilisateur avec ces factures
    const billsList = new Bills({
      document,
      onNavigate,
      localStorage: window.localStorage,
      store: null,
    });
    // vérifier si la fonction handleClickNewBill a été appelée ou non lorsque l'utilisateur clique sur le bouton "New Bill"
    const handleClickNewBill = jest.fn(billsList.handleClickNewBill);
    //récupérer le bouton avec l'attribut 'data-testid' égal à "btn-new-bill"
    //permet de vérifier si le bouton "Nouvelle facture" est présent dans la page HTML.
    const buttonNewBill = screen.getByTestId("btn-new-bill");
    expect(buttonNewBill).toBeTruthy();

    buttonNewBill.addEventListener("click", handleClickNewBill);
    // simule un clic sur le bouton
    fireEvent.click(buttonNewBill);
    //vérifie que la page "Nouvelle facture" a bien été affichée après que l'utilisateur ait cliqué sur le bouton "Nouvelle facture"
    expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
  });
});

/**********************Clique sur l'icone oeil***************************************** */

describe("When I click on an eye icon", () => {
  test("Then modal should open", () => {
    //simule un changement de page dans l'application
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    //remplace l'objet de stockage local natif du navigateur par une simulation pour les besoins du test
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    //simule un état d'authentification pour l'utilisateur dans l'application
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
    const billsInit = new Bills({
      document, //interagit avec le DOM
      onNavigate, //fonction appelée lorsque l'utilisateur navigue vers une nouvelle page
      store: null, //objet qui gère les données de l'application, telles que les utilisateurs, les factures et les connexions, et utilise une API pour accéder à ces données
      localStorage: window.localStorage, // stocker des données dans le navigateur de l'utilisateur
    });
    //simule l'affichage des factures dans l'interface utilisateur
    document.body.innerHTML = BillsUI({ data: bills });
    //crée une fonction mock qui permet de simuler l'appel de la méthode "handleClickIconEye" de la classe "Bills" sans avoir besoin d'utiliser les interactions utilisateur pour le déclencher
    const handleClickIconEye = jest.fn((icon) =>
      billsInit.handleClickIconEye(icon)
    );

    const iconEye = screen.getAllByTestId("icon-eye");
    const modaleFile = document.getElementById("modaleFile");
    $.fn.modal = jest.fn(() => modaleFile.classList.add("show"));
    iconEye.forEach((icon) => {
      icon.addEventListener("click", handleClickIconEye(icon));
      userEvent.click(icon);
      //vérifie que la fonction "handleClickIconEye" a été appelée et que l'élément HTML avec l'id "modaleFile" a été affiché
      expect(handleClickIconEye).toHaveBeenCalled();
    });
    expect(modaleFile).toHaveClass("show");
  });
});

/**************************************************************** */
//ajouter un test d'intégration GET Bills:

describe("When I navigate to Bills", () => {
  test("Then fetches bills from mock API GET", async () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
    new Bills({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });
    document.body.innerHTML = BillsUI({ data: bills });
    await waitFor(() => screen.getByText("Mes notes de frais"));
    expect(screen.getByText("Mes notes de frais")).toBeTruthy();
  });
});

describe("When an error occurs on API", () => {
  beforeEach(() => {
    jest.spyOn(mockStore, "bills");
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "a@a",
      })
    );
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.appendChild(root);
    router();
  });

  test("Then fetches bills from an API and fails with 404 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 404"));
        },
      };
    });
    const html = BillsUI({ error: "Erreur 404" });
    document.body.innerHTML = html;
    const message = screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });

  test("Then fetches messages from an API and fails with 500 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });
    const html = BillsUI({ error: "Erreur 500" });
    document.body.innerHTML = html;
    const message = screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});
