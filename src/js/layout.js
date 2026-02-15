// Apply theme immediately to prevent flash
(function () {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-bs-theme', theme);
})();

// ========================================
// THEME MANAGER (Dark/Light Mode)
// ========================================

const ThemeManager = {
    styleId: "theme-transition-styles",
    currentTheme: null,

    init() {
        // Get current theme from localStorage or document attribute
        const savedTheme = localStorage.getItem('theme');
        const documentTheme = document.documentElement.getAttribute('data-bs-theme');
        this.currentTheme = savedTheme || documentTheme || 'light';

        // Ensure theme is applied and saved
        document.documentElement.setAttribute('data-bs-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);

        this.updateIcon();
    },

    getPositionCoords(position) {
        const positions = {
            "top-left": { cx: "0", cy: "0" },
            "top-right": { cx: "40", cy: "0" },
            "bottom-left": { cx: "0", cy: "40" },
            "bottom-right": { cx: "40", cy: "40" }
        };
        return positions[position] || null;
    },

    generateSVG(variant, start) {
        if (start === "center") return "";

        if (variant === "rectangle-left") {
            return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="grad-left" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:black;stop-opacity:1" /><stop offset="100%" style="stop-color:black;stop-opacity:1" /></linearGradient></defs><rect x="0" y="0" width="100" height="100" fill="url(%23grad-left)"/></svg>`;
        }
        if (variant === "rectangle-right") {
            return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="grad-right" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" style="stop-color:black;stop-opacity:1" /><stop offset="100%" style="stop-color:black;stop-opacity:1" /></linearGradient></defs><rect x="0" y="0" width="100" height="100" fill="url(%23grad-right)"/></svg>`;
        }

        const pos = this.getPositionCoords(start);
        if (!pos) return "";
        const { cx, cy } = pos;

        if (variant === "circle") {
            return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="${cx}" cy="${cy}" r="20" fill="black"/></svg>`;
        }
        if (variant === "circle-blur") {
            return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="${cx}" cy="${cy}" r="18" fill="black" filter="url(%23blur)"/></svg>`;
        }
        return "";
    },

    getTransformOrigin(start) {
        const origins = {
            "top-left": "top left",
            "top-right": "top right",
            "bottom-left": "bottom left",
            "bottom-right": "bottom right"
        };
        return origins[start] || "center";
    },

    createAnimation(variant, start) {
        const svg = this.generateSVG(variant, start);

        if (variant === "rectangle-left") {
            return `
                ::view-transition-group(root) {
                    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                }
                ::view-transition-new(root) {
                    mask: linear-gradient(to right, black 0%, black 100%);
                    mask-size: 0% 100%;
                    mask-position: left center;
                    mask-repeat: no-repeat;
                    animation: slideFromLeft 0.6s ease-out both;
                }
                ::view-transition-old(root) {
                    animation: slideFromLeft 0.6s ease-out both;
                    z-index: -1;
                }
                @keyframes slideFromLeft {
                    from { mask-size: 0% 100%; }
                    to { mask-size: 100% 100%; }
                }
            `;
        }

        if (variant === "rectangle-right") {
            return `
                ::view-transition-group(root) {
                    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                }
                ::view-transition-new(root) {
                    mask: linear-gradient(to left, black 0%, black 100%);
                    mask-size: 0% 100%;
                    mask-position: right center;
                    mask-repeat: no-repeat;
                    animation: slideFromRight 0.6s ease-out both;
                }
                ::view-transition-old(root) {
                    animation: slideFromRight 0.6s ease-out both;
                    z-index: -1;
                }
                @keyframes slideFromRight {
                    from { mask-size: 0% 100%; }
                    to { mask-size: 100% 100%; }
                }
            `;
        }

        const transformOrigin = this.getTransformOrigin(start);
        return `
            ::view-transition-group(root) {
                animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
            }
            ::view-transition-new(root) {
                mask: url('${svg}') ${start.replace("-", " ")} / 0 no-repeat;
                animation: scale-${start} 1.2s both;
                transform-origin: ${transformOrigin};
            }
            ::view-transition-old(root) {
                animation: scale-${start} 1.2s both;
                transform-origin: ${transformOrigin};
                z-index: -1;
            }
            @keyframes scale-${start} {
                from { mask-size: 0; }
                to { mask-size: 350vmax; }
            }
        `;
    },

    updateStyles(css) {
        let styleElement = document.getElementById(this.styleId);
        if (!styleElement) {
            styleElement = document.createElement("style");
            styleElement.id = this.styleId;
            document.head.appendChild(styleElement);
        }
        styleElement.textContent = css;
    },

    updateIcon() {
        const icon = document.querySelectorAll("#theme-toggle-icon,#theme-toggle-icon-small");
        icon.forEach(icon => {
            if (icon) {
                icon.className = this.currentTheme === 'dark'
                    ? 'ri-sun-line cursor fs-5'
                    : 'ri-moon-line cursor fs-5';
            }
        })
    },

    toggle(variant = "circle-blur", start = null) {
        if (!start) {
            start = this.currentTheme === 'dark' ? 'top-left' : 'top-right';
        }

        const animationCSS = this.createAnimation(variant, start);
        this.updateStyles(animationCSS);

        const switchTheme = () => {
            this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', this.currentTheme);
            document.documentElement.setAttribute('data-bs-theme', this.currentTheme);
            this.updateIcon();
        };

        if (!document.startViewTransition) {
            switchTheme();
            return;
        }

        document.startViewTransition(switchTheme);
    }
};


document.addEventListener('DOMContentLoaded', () => {
    // navbar backgroud change on color
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });

    // navbar toggler expanded change bg color of navbar
    const toggler = document.querySelector('.navbar-toggler');
    if (toggler) { 
        toggler.addEventListener('click', () => {
            navbar.classList.toggle('expanded');
        });
    }
});

// lenis smooth scrolling on page
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}

requestAnimationFrame(raf)
