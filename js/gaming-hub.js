(() => {
    "use strict";

    const hasValue = (value) => value !== undefined && value !== null && value !== "";
    const upper = (value) => hasValue(value) ? String(value).toUpperCase() : "";
    const joinFacts = (parts) => parts.filter(Boolean).join(" // ");

    const addFact = (list, label, value) => {
        if (!list || !hasValue(value)) return;

        const row = document.createElement("div");
        const term = document.createElement("dt");
        const description = document.createElement("dd");

        term.textContent = label;
        description.textContent = value;
        row.append(term, description);
        list.append(row);
    };

    const addAction = (list, label, url) => {
        if (!list || typeof url !== "string" || url.trim() === "") return;

        const link = document.createElement("a");
        link.className = "gaming-action";
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = label;
        list.append(link);
    };

    const renderProfile = (name, profile, addFacts, actions) => {
        const card = document.querySelector(`[data-profile="${name}"]`);
        if (!card || !profile || typeof profile !== "object") return false;

        const identity = card.querySelector("[data-profile-identity]");
        const facts = card.querySelector("[data-profile-facts]");
        const actionList = card.querySelector("[data-profile-actions]");

        if (identity) identity.textContent = upper(profile.handle || profile.gamertag);
        if (facts) facts.replaceChildren();
        if (actionList) actionList.replaceChildren();

        addFacts(facts, profile);
        actions.forEach(([label, key]) => addAction(actionList, label, profile[key]));
        return Boolean(identity?.textContent);
    };

    const renderProfiles = (profiles) => {
        if (!profiles || typeof profiles !== "object") return;

        const rendered = [
            renderProfile("steam", profiles.steam, (facts, profile) => {
                addFact(facts, "MEMBER", joinFacts([
                    hasValue(profile.member_since) && `SINCE ${profile.member_since}`,
                    hasValue(profile.level) && `LEVEL ${profile.level}`
                ]));
                addFact(facts, "LIBRARY", joinFacts([
                    hasValue(profile.games) && `${profile.games} GAMES`,
                    hasValue(profile.badges) && `${profile.badges} BADGES`
                ]));
                addFact(facts, "LAST SEEN", joinFacts([
                    upper(profile.recent),
                    hasValue(profile.recent_playtime_hours) && `${profile.recent_playtime_hours} HRS`
                ]));
            }, [["PROFILE", "profile_url"], ["LIBRARY", "library_url"]]),
            renderProfile("xbox", profiles.xbox, (facts, profile) => {
                addFact(facts, "GAMERSCORE", Number.isFinite(profile.gamerscore) ? profile.gamerscore.toLocaleString("en-US") : profile.gamerscore);
                addFact(facts, "ACCESS", hasValue(profile.game_pass) && `GAME PASS ${upper(profile.game_pass)}`);
                addFact(facts, "NETWORK", joinFacts([
                    hasValue(profile.friends) && `${profile.friends} FRIENDS`,
                    hasValue(profile.following) && `${profile.following} FOLLOWING`,
                    hasValue(profile.followers) && `${profile.followers} FOLLOWERS`
                ]));
            }, [["PROFILE", "profile_url"], ["ACHIEVEMENTS", "achievements_url"]]),
            renderProfile("twitch", profiles.twitch, (facts, profile) => {
                addFact(facts, "STATUS", upper(profile.status));
            }, [["CHANNEL", "channel_url"]])
        ];

        const section = document.querySelector("[data-gaming-profiles]");
        if (section && rendered.some(Boolean)) section.hidden = false;
    };

    const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

    const renderMemory = (memory) => {
        const poolNames = {
            recent: "recently_played",
            library: "library",
            recognition: "recognition",
            "old-account": "old_account_energy"
        };
        let rendered = 0;

        document.querySelectorAll("[data-memory-card]").forEach((card) => {
            const pool = memory?.[poolNames[card.dataset.memoryCard]];
            const entries = Array.isArray(pool)
                ? pool.filter((item) => item && typeof item === "object")
                : [];

            if (entries.length === 0) {
                card.hidden = true;
                return;
            }

            const item = pickRandom(entries);
            const title = card.querySelector("[data-memory-title]");
            const meta = card.querySelector("[data-memory-meta]");
            const copy = card.querySelector("[data-memory-copy]");

            if (title) title.textContent = item.title || "";
            if (meta) meta.textContent = item.meta || "";
            if (copy) copy.textContent = item.text || "";
            rendered += 1;
        });

        const section = document.querySelector("[data-gaming-memory]");
        if (section && rendered > 0) section.hidden = false;
    };

    fetch("../data/gaming.json")
        .then((response) => {
            if (!response.ok) throw new Error("Gaming data unavailable");
            return response.json();
        })
        .then((data) => {
            renderProfiles(data.profiles);
            renderMemory(data.memory);
        })
        .catch(() => {
            // The static page remains usable without its optional snapshot data.
        });
})();
