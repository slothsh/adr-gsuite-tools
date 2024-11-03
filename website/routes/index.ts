import { Common } from "@www/common.mts";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import * as THREE from "three";

document.addEventListener("DOMContentLoaded", load);
// document.addEventListener("DOMContentLoaded", main);
document.addEventListener("mousemove", (event: MouseEvent) => {
    mouse.x = event.screenX;
    mouse.y = event.screenY;
    mouse.normalize();
    mouseOffset.x = event.offsetX;
    mouseOffset.y = event.offsetY;
    mouseOffset.normalize();
});

// -----------------------------------------------------------------------------

async function load() {
    const loadingScreen = document.getElementById("loading");
    document.documentElement.style.overflow = "hidden";

    if (loadingScreen) {
        await initThreeJs();

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

        const observer = new ResizeObserver((entries) => {
            updateRenderer();
        });

        observer.observe(parent);
        observer.observe(parentParticles);

        loadingScreen.style.backgroundColor = "transparent";
        setTimeout(() => { loadingScreen.style.display = "none"; }, 1000);
        document.documentElement.style.overflow = "";

        main();
    }
}

async function main() {
    startRender();
}

let parentParticles: HTMLElement;
let parentParticlesRect: DOMRect;
let parentParticlesAspectRatio: number;
let cameraParticles: THREE.OrthographicCamera;
let rendererParticles: THREE.WebGLRenderer;

let parent: HTMLElement;
let parentRect: DOMRect;
let parentAspectRatio: number;
let scene: THREE.Scene;
let sceneParticles: THREE.Scene;
let camera: THREE.OrthographicCamera;
let renderer: THREE.WebGLRenderer;
let logoObject: THREE.Object3D;
let ambientLight: THREE.AmbientLight;
let pointLight: THREE.PointLight;
let sideLight: THREE.PointLight;
let particleMaterial: THREE.ShaderMaterial;
let plane: THREE.Mesh;
let mouse: THREE.Vector2 = new THREE.Vector2(0.0, 0.0);
let mouseOffset: THREE.Vector2 = new THREE.Vector2(0.0, 0.0);
const unitScale = new THREE.Vector3(1.0, 1.0, 1.0);

function startRender(time?: number) {
    if (logoObject) {
        if (logoObject.scale.dot(logoObject.scale) < unitScale.dot(unitScale)) {
            logoObject.scale.set(logoObject.scale.x + 0.1, logoObject.scale.y + 0.1, logoObject.scale.z + 0.1, );
        }

        logoObject.lookAt(mouse.x, -mouse.y, 2.0);

        if (pointLight) {
            pointLight.lookAt(logoObject.position);
        }

        if (sideLight) {
            sideLight.lookAt(logoObject.position);
        }
    }

    if (particleMaterial) {
        particleMaterial.uniforms.iResolution.value.set(parentParticlesRect.width, parentParticlesRect.height);
        particleMaterial.uniforms.iTime.value = time;
    }

    renderer.render(scene, camera);
    // rendererParticles.render(sceneParticles, cameraParticles);
    requestAnimationFrame(startRender);
}

function updateRenderer() {
    parentParticlesRect = parentParticles.getBoundingClientRect();
    parentParticlesAspectRatio = parentParticlesRect.width / parentParticlesRect.height;
    cameraParticles.left = -parentParticlesRect.width/parentParticlesRect.height;
    cameraParticles.right = parentParticlesRect.width/parentParticlesRect.height;
    cameraParticles.updateProjectionMatrix();
    rendererParticles.setSize(parentParticlesRect.width, parentParticlesRect.height);
    rendererParticles.setPixelRatio(window.devicePixelRatio);

    parentRect = parent.getBoundingClientRect();
    parentAspectRatio = parentRect.width / parentRect.height;
    camera.left = -parentRect.width/parentRect.height;
    camera.right = parentRect.width/parentRect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(parentRect.width, parentRect.height);
    renderer.setPixelRatio(window.devicePixelRatio);
}

async function initThreeJs() {
    parent = document.querySelector("section#landing");
    parentRect = parent.getBoundingClientRect();
    parentAspectRatio = parentRect.width / parentRect.height;
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-parentRect.width/parentRect.height, parentRect.width/parentRect.height);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(parentRect.width, parentRect.height);
    parent.appendChild(renderer.domElement);
    ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    pointLight = new THREE.PointLight(0xffffff, 1.0, 0);
    pointLight.position.set(0.0, 0.0, 7.0);
    sideLight = new THREE.PointLight(0xffffff, 1, 0);
    sideLight.position.set(0.0, 0.5, 4.0);
    sideLight.rotation.set(0.0, Math.PI / 2, 0.0);
    scene.add(ambientLight);
    scene.add(pointLight);
    scene.add(sideLight);
    camera.position.z = 3;

    const loader = new OBJLoader();

    const object = await loader.loadAsync( "/assets/logo-adrenaline-lowpoly.obj", () => {});

	object.scale.set(1.0, 1.0, 1.0);
    object.position.x = 1.0;

    for (const child of object.children) {
        if (child instanceof THREE.Mesh) {
            child.geometry.computeVertexNormals();
            child.material.side = THREE.CullFaceBack;
            if (child.name === "Square") {
                child.material = new THREE.MeshPhongMaterial({
                    color: 0x181818,
                    side: THREE.CullFaceBack,
                    specular: 0xffffff,
                });
            } else if (child.name.startsWith("Line")) {
                child.material = new THREE.MeshPhongMaterial({
                    color: 0x3d85b9,
                    side: THREE.CullFaceNone,
                    specular: 0xffffff,
                    emissive: 0x3d85b9,
                    emissiveIntensity: 1.0,
                });
            }
        }
    }

    logoObject = object;
	scene.add(object);

    parentParticles = document.querySelector("div#page");
    parentParticlesRect = parentParticles.getBoundingClientRect();
    parentParticlesAspectRatio = parentParticlesRect.width / parentParticlesRect.height;
    cameraParticles = new THREE.OrthographicCamera(-parentParticlesRect.width/parentParticlesRect.height, parentParticlesRect.width/parentParticlesRect.height);
    rendererParticles = new THREE.WebGLRenderer({ alpha: true, antialias: true, });
    rendererParticles.setPixelRatio(window.devicePixelRatio);
    rendererParticles.setSize(parentParticlesRect.width, parentParticlesRect.height);
    parentParticles.appendChild(rendererParticles.domElement);
    sceneParticles = new THREE.Scene();
    parentParticlesRect = parentParticles.getBoundingClientRect();
    particleMaterial = new THREE.ShaderMaterial({
	    uniforms: {
		    iTime: { value: 0.0 },
		    iResolution: { value: new THREE.Vector2(parentParticlesRect.width, parentParticlesRect.height) },
		    vParticleColor: { value: new THREE.Vector4(0x18/255.0, 0x2c/255.0, 0x32/255.0, 1.0) },
	    },

	    vertexShader: document.getElementById("vertexShader").textContent,
	    fragmentShader: document.getElementById("fragmentShader").textContent
    });


    const geometry = new THREE.PlaneGeometry(4.5, 2);
    plane = new THREE.Mesh(geometry, particleMaterial);
    plane.position.set(0.0, 0.0, -1.0);
    sceneParticles.add(plane);

    return true;
}

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
                href: "/assets/logo-adrenaline-lowpoly.obj",
                as: "text",
                type: "text/plain",
            },
            {
                rel: "prefetch",
                href: "/assets/spinner.svg",
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
            title: "US to UK English Word Substitution",
            summary: "Easily substitute US English words with UK English in any source text.",
            image: {
                src: "/assets/us-to-uk.svg",
                alt: "Icon representing US to UK word substitution"
            }
        },
        {
            title: "Extract Variant Words",
            summary: "Filter and Extract US or UK English words from any source text.",
            image: {
                src: "/assets/extract-words.svg",
                alt: "Icon depicting extraction of English language variants"
            }
        },
        {
            title: "Dictionary Included",
            summary: "More than 1800 US to UK word variants are provided by default.",
            image: {
                src: "/assets/big-dictionary.svg",
                alt: "Icon representing a dictionary that has over 1800 US to UK word mappings"
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
            title: "Simple Functions",
            summary: "Utilizes straightforward Google Sheets functions for easy use.",
            image: {
                src: "/assets/simple-functions.svg",
                alt: "Icon illustrating simple functions"
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
            title: "Example-Driven Help",
            summary: "Comes with numerous examples to guide you through usage.",
            image: {
                src: "/assets/example-usage.svg",
                alt: "Icon representing help with examples"
            }
        },
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
            src: "https://www.youtube.com/embed/yQf6u6FQx0Y?si: Nd1w6jegX11HFXwZ",
            title: "YouTube video player",
            frameborder: "0",
            allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
            referrerpolicy: "strict-origin-when-cross-origin",
            allowfullscreen: true,
        },
    ]
}
