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

    pageTitle: "Adrenaline Studios GSuite™ Tools",

    head: {
        links: [
            {
                rel: "prefetch",
                href: "/assets/photo.svg",
                as: "image",
                type: "image/svg+xml",
            },
            {
                rel: "prefetch",
                href: "/assets/card.svg",
                as: "image",
                type: "image/svg+xml",
            }
        ]
    },

    landing: {
        title: "Tools that make dubbing not suck.",
        subtitle: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro, atque nihil. Eos debitis suscipit alias optio nostrum id deserunt molestias.",
        image: {
            src: "/assets/photo.svg",
            alt: "placeholder image",
        }
    },

    about: {
        title: "About",
        body: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Fuga ullam dolore nostrum, placeat dignissimos repellat tempora doloremque mollitia quod maxime quis debitis cupiditate cumque neque reiciendis perspiciatis id animi? Animi!",
    },

    features: [
        {
            title: "Feature One",
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
            image: {
                src: "/assets/photo.svg",
                alt: "",
            },
        },
        {
            title: "Feature One",
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
            image: {
                src: "/assets/photo.svg",
                alt: "",
            },
        },
        {
            title: "Feature One",
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
            image: {
                src: "/assets/photo.svg",
                alt: "",
            },
        },
        {
            title: "Feature One",
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
            image: {
                src: "/assets/photo.svg",
                alt: "",
            },
        },
        {
            title: "Feature One",
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
            image: {
                src: "/assets/photo.svg",
                alt: "",
            },
        },
        {
            title: "Feature One",
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
            image: {
                src: "/assets/photo.svg",
                alt: "",
            },
        },
        {
            title: "Feature One",
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
            image: {
                src: "/assets/photo.svg",
                alt: "",
            },
        },
        {
            title: "Feature One",
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
            image: {
                src: "/assets/photo.svg",
                alt: "",
            },
        },
    ],

    examples: [
        {
            title: "Example One",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ea quisquam maxime aperiam dolor iste vitae explicabo, deleniti atque.",
            image: {
                src: "/assets/card.svg",
                alt: "",
            },
        },
        {
            title: "Example One",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ea quisquam maxime aperiam dolor iste vitae explicabo, deleniti atque.",
            image: {
                src: "/assets/card.svg",
                alt: "",
            },
        },
        {
            title: "Example One",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ea quisquam maxime aperiam dolor iste vitae explicabo, deleniti atque.",
            image: {
                src: "/assets/card.svg",
                alt: "",
            },
        },
        {
            title: "Example One",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ea quisquam maxime aperiam dolor iste vitae explicabo, deleniti atque.",
            image: {
                src: "/assets/card.svg",
                alt: "",
            },
        },
    ],

    videos: [
        {
            width: 1120,
            height: 630,
            src: "https://www.youtube.com/embed/-niUBSx3PKQ?si=FSsHAmkdMh3RKVZN",
            title: "YouTube video player",
            frameborder: "0",
            allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
            referrerpolicy: "strict-origin-when-cross-origin",
            allowfullscreen: true,
        },
        {
            width: 1120,
            height: 630,
            src: "https://www.youtube.com/embed/-niUBSx3PKQ?si=FSsHAmkdMh3RKVZN",
            title: "YouTube video player",
            frameborder: "0",
            allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
            referrerpolicy: "strict-origin-when-cross-origin",
            allowfullscreen: true,
        },
    ]
}
