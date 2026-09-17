(() => {
    "use strict";

    const embeds = document.querySelectorAll("iframe[data-youtube-src]");

    const parseEmbed = (value) => {
        try {
            const url = new URL(value);
            const id = url.pathname.match(/^\/embed\/([A-Za-z0-9_-]{6,20})$/)?.[1];

            if (url.protocol !== "https:" || url.hostname !== "www.youtube-nocookie.com" || !id) {
                return null;
            }

            return {
                embedUrl: url.href,
                watchUrl: `https://www.youtube.com/watch?v=${id}`
            };
        } catch {
            return null;
        }
    };

    embeds.forEach((iframe) => {
        const source = parseEmbed(iframe.dataset.youtubeSrc || "");

        if (!source) {
            iframe.remove();
            return;
        }

        const title = iframe.title || "YouTube-Video";
        const placeholder = document.createElement("div");
        placeholder.className = "youtube-consent";
        placeholder.innerHTML = `
            <div class="youtube-consent__content">
                <p class="youtube-consent__kicker">:: external video ::</p>
                <p class="youtube-consent__title"></p>
                <p class="youtube-consent__notice">
                    Erst nach deiner Zustimmung wird der YouTube-Player geladen.
                    Dabei können Daten an Google übertragen werden.
                </p>
                <div class="youtube-consent__actions">
                    <button class="youtube-consent__load" type="button">
                        YouTube-Video laden
                    </button>
                    <a class="youtube-consent__link" target="_blank" rel="noopener noreferrer">
                        Direkt auf YouTube öffnen
                    </a>
                </div>
            </div>`;

        placeholder.querySelector(".youtube-consent__title").textContent = title;

        const directLink = placeholder.querySelector(".youtube-consent__link");
        directLink.href = source.watchUrl;
        directLink.setAttribute("aria-label", `${title} direkt auf YouTube öffnen`);

        const loadButton = placeholder.querySelector(".youtube-consent__load");
        loadButton.setAttribute("aria-label", `${title}: YouTube-Video laden`);
        loadButton.addEventListener("click", () => {
            iframe.src = source.embedUrl;
            iframe.removeAttribute("data-youtube-src");
            placeholder.replaceWith(iframe);
            iframe.focus();
        }, { once: true });

        iframe.classList.add("youtube-consent__frame");
        iframe.before(placeholder);
    });
})();
