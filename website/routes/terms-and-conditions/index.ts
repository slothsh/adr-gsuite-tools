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

    pageTitle: "Terms and Conditions",

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

    termsAndConditions: [
        {
            title: "Introduction",
            text: `Welcome to Adrenaline Studios GSuite™ Tools (the "Add-on"). These Terms and Conditions ("Terms") govern your use of the Add-on provided by Flibbing Bits, Pty. Ltd. ("we", "us", "our"). By installing or using the Add-on, you agree to be bound by these Terms. If you do not agree to these Terms, please do not install or use the Add-on.`,
        },

        {
            title: "License",
            text: "We grant you a limited, non-exclusive, non-transferable, and revocable license to use the Add-on in accordance with these Terms.",
        },

        {
            title: "Compliance with Google Policies",
            text: "You agree to comply with all applicable Google Workspace and Google API policies and guidelines. Any breach of these policies may result in the termination of your access to the Add-on.",
        },

        {
            title: "Restrictions",
            list: {
                title: "You shall not:",
                items: [
                    "Reverse engineer, decompile, or disassemble the Add-on.",
                    "Modify or create derivative works based on the Add-on.",
                    "Use the Add-on in a manner that could damage, disable, overburden, or impair the Google Workspace services.",
                    "Use the Add-on for any illegal or unauthorized purpose.",
                ],
            },
        },

        {
            title: "Data Collection",
            text: "The Add-on may collect and process personal data as described in our Privacy Policy. By using the Add-on, you consent to such data collection and processing.",
        },

        {
            title: "Data Usage",
            text: "We use the data collected to provide and improve the Add-on's functionality, enhance user experience, and comply with legal obligations.",
        },

        {
            title: "Third-Party Services",
            text: "The Add-on may integrate with third-party services. We are not responsible for the privacy practices of these third parties, and we encourage you to review their privacy policies.",
        },

        {
            title: "Intellectual Property",
            text: "All intellectual property rights in the Add-on, including but not limited to design, code, and content, are owned by Flibbing Bits, Pty. Ltd. or our licensors. You do not acquire any rights in the Add-on except as expressly granted in these Terms.",
        },

        {
            title: "Termination",
            text: "We reserve the right to terminate or suspend your access to the Add-on at any time, with or without notice, if we believe you have violated these Terms or applicable laws.",
        },

        {
            title: "Limitation of Liability",
            text: "To the maximum extent permitted by law, Flibbing Bits, Pty. Ltd. shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of your use or inability to use the Add-on.",
        },

        {
            title: "Indemnification",
            text: "You agree to indemnify, defend, and hold harmless Flibbing Bits, Pty. Ltd. from and against any claims, liabilities, damages, losses, and expenses, including legal fees, arising out of your use of the Add-on or violation of these Terms.",
        },

        {
            title: "Changes to These Terms",
            text: "We reserve the right to modify these Terms at any time. Any changes will be effective upon posting the revised Terms on our website or through the Add-on. Your continued use of the Add-on following any changes constitutes your acceptance of the revised Terms.",
        },

        {
            title: "Governing Law",
            text: "These Terms shall be governed by and construed in accordance with the laws of South Africa, without regard to its conflict of law principles.",
        },

        {
            title: "Contact Information",
            text: `If you have any questions about these Terms, please contact us at <a href="mailto:${Common.CONTACT.emailSupport}">${Common.CONTACT.emailSupport}.</a>`,
        },
    ],
};
