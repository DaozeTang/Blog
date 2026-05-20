(() => {
	if (window.mermaidInitialized) return;

	window.mermaidInitialized = true;

	let currentTheme = null;
	let isRendering = false;
	let retryCount = 0;
	const MAX_RETRIES = 3;
	const RETRY_DELAY = 1000;

	function hasThemeChanged() {
		const isDark = document.documentElement.classList.contains("dark");
		const newTheme = isDark ? "dark" : "default";

		if (currentTheme !== newTheme) {
			currentTheme = newTheme;
			return true;
		}
		return false;
	}

	function waitForMermaid(timeout = 10000) {
		return new Promise((resolve, reject) => {
			const startTime = Date.now();

			function check() {
				if (window.mermaid && typeof window.mermaid.initialize === "function") {
					resolve(window.mermaid);
				} else if (Date.now() - startTime > timeout) {
					reject(new Error("Mermaid library failed to load within timeout"));
				} else {
					setTimeout(check, 100);
				}
			}

			check();
		});
	}

	function setupMutationObserver() {
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (
					mutation.type === "attributes" &&
					mutation.attributeName === "class"
				) {
					const target = mutation.target;
					const wasDark = mutation.oldValue
						? mutation.oldValue.includes("dark")
						: false;
					const isDark = target.classList.contains("dark");

					if (wasDark !== isDark && hasThemeChanged()) {
						setTimeout(() => renderMermaidDiagrams(), 150);
					}
				}
			});
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
			attributeOldValue: true,
		});
	}

	function setupEventListeners() {
		document.addEventListener("astro:page-load", () => {
			currentTheme = null;
			retryCount = 0;
			if (hasThemeChanged()) {
				setTimeout(() => renderMermaidDiagrams(), 100);
			}
		});

		document.addEventListener("visibilitychange", () => {
			if (!document.hidden) {
				setTimeout(() => renderMermaidDiagrams(), 200);
			}
		});
	}

	async function initializeMermaid() {
		try {
			await waitForMermaid();

			window.mermaid.initialize({
				startOnLoad: false,
				theme: "default",
				themeVariables: {
					fontFamily: "inherit",
					fontSize: "16px",
				},
				securityLevel: "loose",
				errorLevel: "warn",
				logLevel: "error",
			});

			await renderMermaidDiagrams();
		} catch (error) {
			console.error("Failed to initialize Mermaid:", error);
			if (retryCount < MAX_RETRIES) {
				retryCount++;
				setTimeout(() => initializeMermaid(), RETRY_DELAY * retryCount);
			}
		}
	}

	async function renderMermaidDiagrams() {
		if (isRendering) return;

		if (!window.mermaid || typeof window.mermaid.render !== "function") {
			console.warn("Mermaid not available, skipping render");
			return;
		}

		isRendering = true;

		try {
			const mermaidElements = document.querySelectorAll(
				".mermaid[data-mermaid-code]",
			);

			if (mermaidElements.length === 0) {
				isRendering = false;
				return;
			}

			await new Promise((resolve) => setTimeout(resolve, 100));

			const htmlElement = document.documentElement;
			const isDark = htmlElement.classList.contains("dark");
			const theme = isDark ? "dark" : "default";

			window.mermaid.initialize({
				startOnLoad: false,
				theme: theme,
				themeVariables: {
					fontFamily: "inherit",
					fontSize: "16px",
					// 强制应用主题变量
					primaryColor: isDark ? "#ffffff" : "#000000",
					primaryTextColor: isDark ? "#ffffff" : "#000000",
					primaryBorderColor: isDark ? "#ffffff" : "#000000",
					lineColor: isDark ? "#ffffff" : "#000000",
					secondaryColor: isDark ? "#333333" : "#f0f0f0",
					tertiaryColor: isDark ? "#555555" : "#e0e0e0",
				},
				securityLevel: "loose",
				errorLevel: "warn",
				logLevel: "error",
			});

			const renderPromises = Array.from(mermaidElements).map(
				async (element, index) => {
					let attempts = 0;
					const maxAttempts = 3;

					while (attempts < maxAttempts) {
						try {
							const code = element.getAttribute("data-mermaid-code");
							if (!code) break;

							element.innerHTML =
								'<div class="mermaid-loading">Rendering diagram...</div>';

							const { svg } = await window.mermaid.render(
								`mermaid-${Date.now()}-${index}-${attempts}`,
								code,
							);

							element.innerHTML = svg;

							const svgElement = element.querySelector("svg");
							if (svgElement) {
								svgElement.setAttribute("width", "100%");
								svgElement.removeAttribute("height");
								svgElement.style.maxWidth = "100%";
								svgElement.style.height = "auto";
								svgElement.style.filter = isDark
									? "brightness(0.9) contrast(1.1)"
									: "none";
							}

							break;
						} catch (error) {
							attempts++;
							console.warn(
								`Mermaid rendering attempt ${attempts} failed for element ${index}:`,
								error,
							);

							if (attempts >= maxAttempts) {
								console.error(
									`Failed to render Mermaid diagram after ${maxAttempts} attempts:`,
									error,
								);
								element.innerHTML = `
									<div class="mermaid-error">
										<p>Failed to render diagram after ${maxAttempts} attempts.</p>
										<button onclick="location.reload()" style="margin-top: 8px; padding: 4px 8px; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer;">
											Retry Page
										</button>
									</div>
								`;
							} else {
								await new Promise((resolve) =>
									setTimeout(resolve, 500 * attempts),
								);
							}
						}
					}
				},
			);

			await Promise.all(renderPromises);
			retryCount = 0;
		} catch (error) {
			console.error("Error in renderMermaidDiagrams:", error);

			if (retryCount < MAX_RETRIES) {
				retryCount++;
				setTimeout(() => renderMermaidDiagrams(), RETRY_DELAY * retryCount);
			}
		} finally {
			isRendering = false;
		}
	}

	function initializeThemeState() {
		const isDark = document.documentElement.classList.contains("dark");
		currentTheme = isDark ? "dark" : "default";
	}

	async function loadMermaid() {
		if (typeof window.mermaid !== "undefined") return Promise.resolve();

		return new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.src =
				"https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";

			script.onload = () => resolve();

			script.onerror = () => {
				const fallbackScript = document.createElement("script");
				fallbackScript.src = "https://unpkg.com/mermaid@11/dist/mermaid.min.js";
				fallbackScript.onload = () => resolve();
				fallbackScript.onerror = () =>
					reject(
						new Error(
							"Failed to load Mermaid from both primary and fallback CDNs",
						),
					);
				document.head.appendChild(fallbackScript);
			};

			document.head.appendChild(script);
		});
	}

	async function initialize() {
		try {
			setupMutationObserver();
			setupEventListeners();
			initializeThemeState();
			await loadMermaid();
			await initializeMermaid();
		} catch (error) {
			console.error("Failed to initialize Mermaid system:", error);
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initialize);
	} else {
		initialize();
	}
})();
