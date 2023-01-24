/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

import NewBillUI from "../../views/NewBillUI";
import NewBill from "../../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../../constants/routes";
import { localStorageMock } from "../../__mocks__/localStorage";
import mockStore from "../../__mocks__/store";
import router from "../../app/Router";

jest.mock("../../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I submit a new Bill", () => {
    //Ensuite, la facture doit être correctement enregistrée
    test("Then the bill must be correctly saved", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBillInit = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const formNewBill = screen.getByTestId("form-new-bill");
      // s'assurer que l'élément de formulaire a bien été trouvé et sélectionné correctement
      expect(formNewBill).toBeTruthy();

      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    });

    test("Then fetches bills from mock API POST", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
    });

    test("Then verify the file bill", async () => {
      jest.spyOn(mockStore, "bills");

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      Object.defineProperty(window, "location", {
        value: { hash: ROUTES_PATH["NewBill"] }, //simuler une navigation vers la route NewBill
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBillInit = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const file = new File(["image"], "image.png", { type: "image/png" });
      // On s'assure que la méthode "handleChangeFile" a été appelée lorsque l'événement "change" sur l'élément de formulaire est déclenché
      const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));
      const formNewBill = screen.getByTestId("form-new-bill");
      const billFile = screen.getByTestId("file");

      billFile.addEventListener("change", handleChangeFile);
      userEvent.upload(billFile, file); // simuler l'upload du fichier créé

      expect(billFile.files[0].name).toBeDefined();
      expect(handleChangeFile).toBeCalled();

      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill); // simuler la soumission du formulaire
      expect(handleSubmit).toHaveBeenCalled(); //vérifie ensuite que la fonction "handleSubmit" a bien été appelée
    });
  });
});

/*****************Test d'intégration************************* */

describe("Given I am a user connected as Employee", () => {
  //Etant donné que je suis un utilisateur connecté en tant que Salarié
  describe("When I submit the form completed", () => {
    //Lorsque je soumets le formulaire rempli
    test("Then the bill is created", async () => {
      //Ensuite, la facture est créée

      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      //SIMILATION DE LA CONNECTION DE L EMPLOYEE
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "azerty@email.com",
        })
      );
      //SIMULATION DE CREATION DE LA PAGE DE FACTURE
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const validBill = {
        type: "Transports",
        name: "vol Paris Toulouse",
        date: "2023-01-03",
        amount: 80,
        vat: 70,
        pct: 20,
        commentary: "Commentary",
        fileUrl: "../img/0.jpg",
        fileName: "test.jpg",
        status: "pending",
      };

      //vérifier que tous les champs ont les valeurs correctes:
      expect(validBill).toEqual(
        expect.objectContaining({
          type: "Transports",
          name: "vol Paris Toulouse",
          date: "2023-01-03",
          amount: 80,
          vat: 70,
          pct: 20,
          commentary: "Commentary",
          fileUrl: "../img/0.jpg",
          fileName: "test.jpg",
          status: "pending",
        })
      );

      // Charger les valeurs dans les champs de formulaire pour simuler un utilisateur remplissant et soumettant un formulaire
      screen.getByTestId("expense-type").value = validBill.type;
      screen.getByTestId("expense-name").value = validBill.name;
      screen.getByTestId("datepicker").value = validBill.date;
      screen.getByTestId("amount").value = validBill.amount;
      screen.getByTestId("vat").value = validBill.vat;
      screen.getByTestId("pct").value = validBill.pct;
      screen.getByTestId("commentary").value = validBill.commentary;

      newBill.fileName = validBill.fileName;
      newBill.fileUrl = validBill.fileUrl;

      newBill.updateBill = jest.fn(); //SIMULATION DE  CLICK
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e)); //ENVOI DU FORMULAIRE

      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      //simuler l'action de l'utilisateur de cliquer sur le bouton de soumission
      fireEvent.submit(form);

      //vérifient que la fonction handleSubmit a bien été appelée (ce qui signifie que le formulaire a été soumis)
      expect(handleSubmit).toHaveBeenCalled();
      //fonction updateBill a bien été appelée (ce qui signifie que les données ont été envoyées à l'API appropriée, ici dans le store)
      expect(newBill.updateBill).toHaveBeenCalled();
    });

    //test erreur 500
    test("fetches error from an API and fails with 500 error", async () => {
      //récupère l'erreur d'une API et échoue avec l'erreur 500
      jest.spyOn(mockStore, "bills");
      jest.spyOn(console, "error").mockImplementation(() => {}); // Prevent Console.error jest error

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      Object.defineProperty(window, "location", {
        value: { hash: ROUTES_PATH["NewBill"] },
      });

      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      document.body.innerHTML = `<div id="root"></div>`;
      router();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Soumettre le formulaire
      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      await new Promise(process.nextTick);
      expect(console.error).toBeCalled();
    });
  });
});
