import { Common } from "@www/common.mts";

function main() {
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
}

document.addEventListener("DOMContentLoaded", main);

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

    lastUpdated: new Date("2024-11-06").toDateString(),

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
            title: "Data Protection and Security",
            text: [
                "We are committed to safeguarding the personal information you share with us. To ensure the protection of your data, we implement a variety of security measures, including encryption, access controls, and regular security audits.",
                "Although we do not capture or store any personal data, in the event that your personal information is stored, we will do so using secure servers that are accessible only to authorized personnel who have a legitimate need to access the data in order to provide services.",
                "Additionally, we follow industry best practices and comply with relevant data protection laws to prevent unauthorized access, use, or disclosure of your information. However, please be aware that no method of electronic storage or transmission is 100% secure, and while we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security.",
            ],
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
