import WindowIcon from "../assets/svg/window.js";
import MailIcon from "../assets/svg/mail.js";
import DisconnectIcon from "../assets/svg/disconnect.js";

export default (height) => {
  let user;
  user = JSON.parse(localStorage.getItem("user"));
  if (typeof user === "string") {
    user = JSON.parse(user);
  }
  //afficher différentes icônes en fonction du type d'utilisateur connecté
  //Si l'utilisateur est un employé, une icône de fenêtre est affichée et un attribut data-testid "icon-window" est ajouté.
  if (user && user.type === "Employee") {
    return `
        <div class='vertical-navbar' style='height: ${height}vh;'>
          <div class='layout-title'> Billed </div>
          <div id='layout-icon1' data-testid="icon-window">
            ${WindowIcon}
          </div>
          <div id='layout-icon2' data-testid="icon-mail">
            ${MailIcon}
          </div>
          <div id='layout-disconnect'>
            ${DisconnectIcon}
          </div>
      </div>
        `;
  } else {
    return `
        <div class='vertical-navbar' style='height: ${height}vh;'>
          <div class='layout-title'> Billed </div>
            <div id='layout-disconnect' data-testid='layout-disconnect'>
              ${DisconnectIcon}
            </div>
          </div>
        `;
  }
};
