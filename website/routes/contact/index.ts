import { Common } from "@www/common.mts";

const NAVIGATION_MENU = Common.NavigationMenu.fromElementIds("pageMenu", "pageMenuButton");
if (NAVIGATION_MENU === null) {
    console.error(`could not initialize navigation menu with id "pageMenu"`);
} else {
    NAVIGATION_MENU.registerListeners();
}

document.querySelectorAll("a[href^='#'], a[href^='/#']").forEach(anchor => {
    anchor.addEventListener("click", function (event) {
        const href: string = this.getAttribute("href");
        if (href.startsWith("/") && document.location.pathname === "/") {
            event.preventDefault();
            document.querySelector(href.slice(1)).scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});

export default {
    common: Common.CONTENT,

    applicationName: Common.APPLICATION_NAME,
    email: Common.CONTACT.emailContact,

    head: {
        links: [
            {
                rel: "prefetch",
                href: "assets/photo.svg",
                as: "image",
                type: "image/svg+xml",
            },
            {
                rel: "prefetch",
                href: "assets/card.svg",
                as: "image",
                type: "image/svg+xml",
            }
        ]
    },

    pageTitle: "Contact",
}
