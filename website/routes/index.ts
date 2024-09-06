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

    pageTitle: "Adrenaline Studios Toolkit",

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
        title: "Tools that Simplify Localisation",
        subtitle: "Adrenaline Studios Toolkit provides you with a handy suite of functions and utilities for performing localisation tasks inside of Sheets.",
        image: {
            src: "/assets/logo-adrenaline.svg",
            alt: "placeholder image",
        }
    },

    features: [
        {
            title: "US to UK Converter",
            summary: "Easily substitute US English words with UK English in any source text.",
            image: {
                src: "/assets/us-to-uk.svg",
                alt: "Icon representing US to UK word substitution"
            }
        },
        {
            title: "Extract English Variants",
            summary: "Quickly extract US or UK English words from any source text.",
            image: {
                src: "/assets/extract-words.svg",
                alt: "Icon depicting extraction of English language variants"
            }
        },
        {
            title: "Custom Dictionaries",
            summary: "Define custom dictionaries for substituting or ignoring specific words.",
            image: {
                src: "/assets/user-dictionary.svg",
                alt: "Icon for custom dictionary settings"
            }
        },
        {
            title: "Sheets Range Support",
            summary: "Works seamlessly with regular Google Sheets ranges as input.",
            image: {
                src: "/assets/range-support.svg",
                alt: "Icon showing Google Sheets range support"
            }
        },
        {
            title: "Completely Free",
            summary: "This addon is available at no cost.",
            image: {
                src: "/assets/free.svg",
                alt: "Icon representing a free addon"
            }
        },
        {
            title: "Simple Functions",
            summary: "Utilizes straightforward Google Sheets functions for easy use.",
            image: {
                src: "/assets/simple-functions.svg",
                alt: "Icon illustrating simple functions"
            }
        },
        {
            title: "Example-Driven Help",
            summary: "Comes with numerous examples to guide you through usage.",
            image: {
                src: "/assets/example-usage.svg",
                alt: "Icon representing help with examples"
            }
        },
        {
            title: "Language Localization",
            summary: "Easily adapt your text for regional English differences.",
            image: {
                src: "/assets/localisation.svg",
                alt: "Icon for language localization"
            }
        }
    ],

    examples: [
        {
            title: "US to UK English and Vice Versa",
            description: "Use the =ADR_US_TO_UK and =ADR_UK_TO_US function to automatically convert US/UK word variants to their counterparts. For example, converting 'color' to 'colour' and 'organize' to 'organise'.",
            image: {
                src: "/assets/example1.svg",
                alt: "Example of converting US English words to UK English using ADR_US_TO_UK function."
            }
        },
        {
            title: "Custom Substitutions with Exceptions",
            description: "Specify a list of words to include or ignore during substitution using the =ADR_US_TO_UK function. For example, convert 'color' to 'colour' while ignoring 'favorite' so it won't change to 'favourite'.",
            image: {
                src: "/assets/example2.svg",
                alt: "Example of using custom substitutions and ignore lists with ADR_US_TO_UK function."
            }
        },
        {
            title: "Extract Specific Words",
            description: "Identify and extract US/UK specific words from your text using the =ADR_US_WORDS or =ADR_UK_WORDS functions. This can be useful for analyzing which version of English is being used in your content.",
            image: {
                src: "/assets/example3.svg",
                alt: "Example of extracting US or UK English-specific words using ADR_US_WORDS or ADR_UK_WORDS functions."
            }
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
