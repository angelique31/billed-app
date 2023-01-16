import { ROUTES_PATH } from "../constants/routes.js";
import { formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";

/**
 *  classe utilisée pour afficher des factures et gérer des interactions utilisateur avec ces factures.
 */
export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    //La propriété "store" utilisée pour gérer les données de l'application, telles que les utilisateurs, les factures et les connexions, et utilise une API pour accéder à ces données.
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const buttonNewBill = document.querySelector(
      `button[data-testid="btn-new-bill"]`
    );
    // console.log(buttonNewBill);
    if (buttonNewBill)
      //ajoute un écouteur d'événement "click" sur le bouton "Nouvelle facture":
      buttonNewBill.addEventListener("click", this.handleClickNewBill);
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye)
      iconEye.forEach((icon) => {
        // console.log(iconEye);
        icon.addEventListener("click", () => this.handleClickIconEye(icon));
      });
    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = () => {
    //indique à l'application quelle page doit être chargée lorsque l'utilisateur clique sur le bouton "Nouvelle facture".
    this.onNavigate(ROUTES_PATH["NewBill"]);
  };

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url");
    // console.log(billUrl);
    const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
    // console.log(imgWidth);
    $("#modaleFile")
      .find(".modal-body")
      .html(
        `<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`
      );
    $("#modaleFile").modal("show");
  };

  getBills = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then((snapshot) => {
          const bills = snapshot.map((doc) => {
            try {
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status),
              };
            } catch (e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e, "for", doc);
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status),
              };
            }
          });
          console.log("length", bills.length);
          return bills;
        });
    }
  };
}
