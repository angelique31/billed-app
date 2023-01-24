import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    //on pointe le formulaire "notes de frais"
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    // console.log(formNewBill);
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    // console.log(file);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }
  handleChangeFile = (e) => {
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    const filePath = e.target.value.split(/\\/g);
    const fileName = filePath[filePath.length - 1];

    //Ajout du nouveau code :
    // Vérifiez l'extension du fichier
    //On divise le nom du fichier pour récupérer l'extension du fichier sélectionné par l'utilisateur, "png par ex"
    const fileInputElement = this.document.querySelector(
      `input[data-testid="file"]`
    );
    const fileNameParts = fileName.split(".");
    //Cette extension est récupérée à l'aide de la propriété "length"
    const fileExtension = fileNameParts[fileNameParts.length - 1];
    //extensions de fichier autorisées
    const allowedExtensions = ["jpg", "jpeg", "png"];
    //Si "fileExtension" n'est pas trouvé dans le tableau "allowedExtensions",l'extension du fichier n'est pas autorisée.
    //Dans ce cas, le code à l'intérieur de la condition "if" sera exécuté.
    if (!allowedExtensions.includes(fileExtension)) {
      fileInputElement.insertAdjacentHTML(
        "beforebegin",
        `<div class="error-message">L'extension du fichier n'est pas autorisée. Veuillez sélectionner un fichier au format jpg, jpeg ou png.</div>`
      );
    } else {
      //supprimer le message d'erreur lorsque l'extension du fichier est autorisée
      const errorMessageElement = this.document.querySelector(".error-message");
      errorMessageElement.innerHTML = "";
    }

    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append("file", file);
    formData.append("email", email);

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ fileUrl, key }) => {
        // console.log(fileUrl);
        this.billId = key;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
      })
      .catch((error) => console.error(error));
  };

  //gérer l'événement de soumission du formulaire
  handleSubmit = (e) => {
    e.preventDefault();
    //champ de saisie pour la date
    // console.log(
    //   'e.target.querySelector(`input[data-testid="datepicker"]`).value',
    //   e.target.querySelector(`input[data-testid="datepicker"]`).value
    // );
    //Récupérer l'adresse e-mail de l'utilisateur connecté
    const email = JSON.parse(localStorage.getItem("user")).email;
    // objet "bill" qui contient les informations du formulaire
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,

      amount: parseInt(
        //amount = Montant
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value, //vat = tva
      //pct = pourcentage (20%)
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,

      fileUrl: this.fileUrl, //fichier contenant l'URL
      fileName: this.fileName, //contiens le nom du fichier téléchargé.
      status: "pending",
    };
    //mettre à jour la facture avec les données du formulaire
    this.updateBill(bill);
    //rediriger l'utilisateur vers une autre page, la page de liste des factures
    this.onNavigate(ROUTES_PATH["Bills"]);
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
