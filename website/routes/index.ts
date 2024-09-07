import { Common } from "@www/common.mts";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import * as THREE from "three";

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

    const initSucces = initThreeJs();

    const observer = new ResizeObserver((entries) => {
        updateRenderer();
    });
    observer.observe(parent);

    if (initSucces) {
        startRender();
    }
}

let parent: HTMLElement;
let parentRect: DOMRect;
let parentAspectRatio: number;
let scene: THREE.Scene;
let camera: THREE.OrthographicCamera;
let renderer: THREE.WebGLRenderer;
let logoObject: THREE.Object3D;
let ambientLight: THREE.AmbientLight;
let pointLight: THREE.PointLight;
let geometry: THREE.BoxGeometry;
let material: THREE.MeshBasicMaterial;
let cube: THREE.Mesh;

function startRender(time?: number) {
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    if (logoObject) {
        logoObject.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(startRender);
}

function updateRenderer() {
    parentRect = parent.getBoundingClientRect();
    parentAspectRatio = parentRect.width / parentRect.height;
    camera.left = -parentRect.width/parentRect.height;
    camera.right = parentRect.width/parentRect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(parentRect.width, parentRect.height);
    renderer.setPixelRatio(window.devicePixelRatio);
}

function initThreeJs() {
    parent = document.querySelector("section#landing");
    parentRect = parent.getBoundingClientRect();
    parentAspectRatio = parentRect.width / parentRect.height;
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-parentRect.width/parentRect.height, parentRect.width/parentRect.height);
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(parentRect.width, parentRect.height);
    parent.appendChild(renderer.domElement);
    ambientLight = new THREE.AmbientLight(0xffffff, 5);
    pointLight = new THREE.PointLight(0xffffff, 5, 0);
    pointLight.position.set(0.0, 0.0, 1.0);
    scene.add(ambientLight);
    scene.add(pointLight);
    camera.position.z = 3;

    const loader = new OBJLoader();

    loader.load(
	    "/assets/logo-adrenaline.obj",
	    // called when resource is loaded
	    function (object: THREE.Object3D) {
		    object.scale.set(1.0, 1.0, 1.0);
            object.position.x = 1.0;

            for (const child of object.children) {
                if (child instanceof THREE.Mesh) {
                    child.material.side = THREE.CullFaceBack;
                    // child.material = new THREE.MeshPhongMaterial({ color: 0x646464, side: THREE.CullFaceBack });
                }
            }

            logoObject = object;
		    scene.add(object);
	    },

	    function() {

	    },

	    // called when loading has errors
	    function (error) {
		    console.log(`An error happened: ${error}`);
	    }
    );

    return true;
}

document.addEventListener("DOMContentLoaded", main);

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
            },
            {
                rel: "prefetch",
                href: "/assets/logo-adrenaline.obj",
                as: "text",
                type: "text/plain",
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
