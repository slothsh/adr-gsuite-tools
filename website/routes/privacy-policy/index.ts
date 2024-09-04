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

    pageTitle: "Privacy Policy",

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

    lastUpdated: new Date("2024-09-03").toDateString(),

    privacyPolicy: [
        {
            title: "Introduction",
            text: `Welcome to ${Common.APPLICATION_NAME} ("we," "our," or "us"). Your privacy is of utmost importance to us. This Privacy Policy explains how we handle any personal data in relation to your use of our web application.`,
        },

        {
            title: "No Data Collection",
            text: "We respect your privacy. We do not collect, store, or process any personal data from users of our web application. This includes but is not limited to names, email addresses, IP addresses, or any other identifiable information.",
        },

        {
            title: "No Use of Cookies or Tracking Technologies",
            text: "Our web application does not use cookies, tracking pixels, or any other similar technologies to collect user data. We do not engage in any form of tracking or data collection while you use our application.",
        },

        {
            title: "Third-Party Services",
            text: "We do not use any third-party services that could collect your data. As a result, you can be confident that your privacy is fully protected when using our web application.",
        },

        {
            title: "Changes to This Privacy Policy",
            text: "We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated effective date. We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your privacy.",
        },

        {
            title: "Contact Us",
            text: `If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:${Common.CONTACT.emailPrivacy}">${Common.CONTACT.emailPrivacy}.</a>`,
        },
    ],
}
