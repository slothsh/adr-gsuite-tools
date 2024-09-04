const PRODUCT_NAME = "Adrenaline Studios GSuite™ Tools";
const FLIBBINGBITS_LOGO_URL = "/assets/flibbingbits-logo.svg";
const ADRENALINE_LOGO_URL = "/assets/logo-adrenaline.svg";
const ADRENALINE_LOGO_LINES_URL = "/assets/logo-adrenaline-lines.svg";
const PHOTO_LOGO_URL = "/assets/photo.svg";

export namespace Common {
    export const APPLICATION_NAME = PRODUCT_NAME;

    export const CONTACT = {
        emailPrivacy: "privacy@flibbingbits.com",
        emailSupport: "support@flibbingbits.com",
        emailContact: "hello@flibbingbits.com",
    };

    export const CONTENT = {
        copyright: "Copyright © 2024, Flibbing Bits",
        copyrightLogoUrl: {
            src: FLIBBINGBITS_LOGO_URL,
            alt: "flibbing bits logo"
        },

        navigation: {
            title: PRODUCT_NAME,
            logo: {
                src: ADRENALINE_LOGO_URL,
                alt: "adrenaline studios logo, blue waveform",
            },

            menuButton: {
                image: {
                    src: "/assets/menu.svg",
                    alt: "menu, three horizontal lines",
                },
            },

            menu: [
                {
                    href: "/#page",
                    text: "Home",
                    logo: {
                        src: PHOTO_LOGO_URL,
                        alt: "placeholder image"
                    }
                },
                {
                    href: "/#features",
                    text: "Features",
                    logo: {
                        src: PHOTO_LOGO_URL,
                        alt: "placeholder image"
                    }
                },
                {
                    href: "/#examples",
                    text: "Examples",
                    logo: {
                        src: PHOTO_LOGO_URL,
                        alt: "placeholder image"
                    }
                },
                {
                    href: "/#videos",
                    text: "Video Demonstrations",
                    logo: {
                        src: PHOTO_LOGO_URL,
                        alt: "placeholder image"
                    }
                },
            ],
        },

        head: {
            links: [
                {
                    href: "/assets/style.css",
                    rel: "stylesheet",
                },
                {
                    href: ADRENALINE_LOGO_URL,
                    rel: "prefetch",
                    as: "image",
                    type: "image/svg+xml",
                },
                {
                    rel: "preconnect",
                    href:"https://fonts.googleapis.com",
                },
                {

                    rel:"preconnect",
                    href:"https://fonts.gstatic.com",
                    crossorigin: null,
                },
                {
                    href:"https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap",
                    rel:"stylesheet",
                }
            ],
        },


        globalFooterAnchors: [
            {
                href: "/privacy-policy",
                text: "Privacy Policy",
            },
            {
                href: "/terms-and-conditions",
                text: "Terms and Conditions",
            },
            {
                href: "/contact",
                text: "Contact",
            }
        ],

    };

    export class NavigationMenu {
        constructor(menuElement: HTMLElement, buttonElement: HTMLElement) {
            // @ts-ignore
            this.element = menuElement;
            // @ts-ignore
            this.button = buttonElement;
            // @ts-ignore
        }

        static fromElementIds(menuId: string, buttonId: string): NavigationMenu | null {
            const menuElement = document.getElementById(menuId);
            if (menuElement === null) {
                return null;
            }

            const buttonElement = document.getElementById(buttonId);
            if (buttonElement === null) {
                return null;
            }

            return new NavigationMenu(menuElement, buttonElement);
        }

        registerListeners(): void {
            // @ts-ignore
            this.button.addEventListener("click", () => {
                this.toggle();
            });

            // @ts-ignore
            this.element.querySelectorAll("a[href^='#'], a[href^='/#']").forEach((anchor: HTMLAnchorElement) => {
                anchor.addEventListener("click", (event: MouseEvent) => {
                    this.toggle();
                });
            });

            document.querySelectorAll("li").forEach((li) => {
                li.addEventListener("click", (event: MouseEvent) => {
                    if ((event.target as Element).tagName !== "A") {
                        const anchor = li.querySelector("a");
                        if (anchor) {
                            anchor.click();
                        }
                    }
                });
            });
        }

        toggle(): void {
            // NOTE: For some reason, between page reloads and cache resets
            // the state of class attributes is maintained. We check this
            // in the event that the NavigationMenu has been reinitialized,
            // but its state has not been propogated to the DOM.

            // @ts-ignore
            this.element.classList.toggle("nav-open");
            // @ts-ignore
            this.button.classList.toggle("nav-open");
            document.body.classList.toggle("nav-open");
        }

        // element: HTMLElement;
        // button: HTMLElement;
        // open: boolean;
    }
}
