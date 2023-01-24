import { ROUTES_PATH } from "../constants/routes.js";
import { formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";

/**
 *  classe utilisée pour afficher des factures et gérer des interactions utilisateur avec ces factures.
 */
export default class Bills {
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
      //ajoute un écouteur d'événement "click" sur le bouton "Nouvelle note de frais":
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

  // Utilise JQuery pour afficher une image de facture spécifique dans un modal
  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url");
    // console.log(billUrl);
    const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
    $("#modaleFile")
      .find(".modal-body")
      .html(
        `<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`
      );
    $("#modaleFile").modal("show");
  };

  //utilisée pour récupérer les factures stockées dans un objet "store" qui gère les données de l'application
  getBills = () => {
    // vérifie si un objet "store" existe
    if (this.store) {
      // console.log(this.store);
      return (
        this.store
          // récupérer les données des factures avec les méthodes bills().list()
          .bills()
          .list()
          .then((snapshot) => {
            //les données sont ensuite formatées et retournées
            const bills = snapshot.map((doc) => {
              // console.log(snapshot);
              try {
                return {
                  ...doc,
                  date: formatDate(doc.date),
                  status: formatStatus(doc.status),
                };
              } catch (e) {
                // if for some reason, corrupted data was introduced, we manage here failing formatDate function
                // log the error and return unformatted date in that case
                // console.log(e, "for", doc);
                return {
                  ...doc,
                  date: doc.date,
                  status: formatStatus(doc.status),
                };
              }
            });
            // console.log("length", bills.length);
            // console.log(bills);
            //retourne un tableau contenant toutes les factures formatées
            return bills;
          })
      );
    }
  };
}
