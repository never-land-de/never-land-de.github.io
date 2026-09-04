(() => {
    "use strict";

    const EMAIL = "jan@never-land.de";
    const MAILTO = `mailto:${EMAIL}`;
    const SISTERS_404 = "https://www.thesistersofmercy.com/error404page.html";

    const form = document.getElementById("terminal-form");
    const input = document.getElementById("terminal-command");
    const output = document.getElementById("terminal-output");
    const screen = document.getElementById("terminal-screen");

    if (!form || !input || !output || !screen) return;

    const history = [];
    let historyIndex = 0;

    const state = {
        cableTaken: false,
        cableConnected: false,
        hatchOpen: false
    };

    const normalise = (value) => value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    const resizeInput = () => {
        const length = Math.max(1, input.value.length + 1);
        input.style.width = `${length}ch`;
    };

    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            screen.scrollTop = screen.scrollHeight;
        });
    };

    const line = (text = "", className = "") => {
        const p = document.createElement("p");
        p.className = className;
        p.textContent = text || "\u00a0";
        output.appendChild(p);
        scrollToBottom();
        return p;
    };

    const linkLine = (label, href) => {
        const p = document.createElement("p");
        const link = document.createElement("a");
        link.className = "nl-terminal__link";
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = label;
        p.appendChild(link);
        output.appendChild(p);
        scrollToBottom();
    };

    const lines = (items, className = "") => {
        items.forEach((item) => line(item, className));
    };

    const echo = (command) => line(`> ${command}`, "nl-terminal__echo");

    const showHelp = () => {
        lines([
            "I understand more than I probably should.",
            "",
            "Useful: LOOK, ABOUT, CONTACT, EMAIL, SEND, INVENTORY, CLEAR, QUIT",
            "Navigation: NORTH, SOUTH, EAST, WEST, UP",
            "",
            "Rumours mention a CHEMIST, a 404 and some CHEAP SUNGLASSES.",
            "Other nouns may also produce results. This was a bad idea."
        ]);
    };

    const look = () => {
        const cable = state.cableTaken
            ? "The loose serial cable is no longer on the floor."
            : "A suspiciously important SERIAL CABLE lies on the floor.";
        const hatch = state.hatchOpen
            ? "A small service hatch on the terminal is open."
            : "There is a small SERVICE HATCH below the keyboard.";

        lines([
            "You are standing in front of a communication terminal of uncertain age.",
            "The display claims to be online. This may be aspirational.",
            cable,
            hatch,
            "The only obvious exit is back to the website. Less obvious exits may involve a chemist."
        ]);
    };

    const inventory = () => {
        const items = [];
        if (state.cableTaken) items.push("one serial cable");
        items.push("an unreasonable amount of early-web nostalgia");
        items.push("a deep aversion to Fake Jazz Nonsense");

        line(`You are carrying ${items.join(", ")}.`);
        line("A drum machine can be heard somewhere, but it belongs to a different adventure.");
    };

    const about = () => {
        lines([
            "The machine belongs to Jan.",
            "NEVER LAND has been online, in one form or another, since the early 2000s.",
            "The name comes from Floodland, not Peter Pan: \"we will never, never land.\"",
            "Same place, different web. This explains several things."
        ]);
    };

    const contact = () => {
        lines([
            "CONTACT RECORD FOUND:",
            EMAIL,
            "",
            "Type SEND to hand this problem to your local mail client."
        ]);
    };

    const send = () => {
        if (!state.cableConnected) {
            lines([
                "The terminal emits a deeply judgmental beep.",
                "COMMUNICATION LINK: technically available, aesthetically questionable.",
                "",
                "You can type SEND again and I will stop pretending the cable matters."
            ]);
            state.cableConnected = true;
            return;
        }

        lines([
            `Opening a message to ${EMAIL} ...`,
            "Good luck out there."
        ]);

        window.setTimeout(() => {
            window.location.href = MAILTO;
        }, 450);
    };

    const openHatch = () => {
        if (state.hatchOpen) {
            line("The service hatch is already open. Its warranty remains void.");
            return;
        }
        state.hatchOpen = true;
        lines([
            "You open the service hatch.",
            "Inside: dust, a port, and the accumulated confidence of twenty years of static HTML."
        ]);
    };

    const takeCable = () => {
        if (state.cableTaken) {
            line("You already have the serial cable. Hoarding will not improve bandwidth.");
            return;
        }
        state.cableTaken = true;
        line("Taken. The cable feels unnecessarily substantial.");
    };

    const connectCable = () => {
        if (!state.cableTaken) {
            line("You would need a cable first. LOOK around.");
            return;
        }
        if (!state.hatchOpen) {
            line("There is nowhere obvious to connect it. Perhaps OPEN HATCH.");
            return;
        }
        if (state.cableConnected) {
            line("The cable is already connected. Against all odds, nothing caught fire.");
            return;
        }
        state.cableConnected = true;
        lines([
            "You connect the serial cable.",
            "CARRIER DETECTED.",
            "A modem somewhere remembers 2003 and quietly screams."
        ]);
    };

    const show404 = () => {
        lines([
            "ERROR 404, PAGE NOT FOUND",
            "Barely Interactive Fiction.",
            "",
            "A respectful nod to The Sisters Of Mercy's wonderfully unnecessary 2002 error page.",
            "Type OPEN 404 to leave this terminal and visit the original."
        ]);
        linkLine("[ The Sisters Of Mercy / Error 404 / Barely Interactive Fiction ]", SISTERS_404);
    };

    const open404 = () => {
        lines([
            "Opening a route to the original 404 page ...",
            "Cheap sunglasses are recommended."
        ]);
        const newWindow = window.open(SISTERS_404, "_blank", "noopener,noreferrer");
        if (newWindow) newWindow.opener = null;
    };

    const readSign = () => {
        lines([
            "The electronic sign flickers:",
            "Platform 1: west to Criminal City and The Slough Of Despond.",
            "Platform 2: southbound to the Land Of Fake Jazz Nonsense.",
            "You decide that SEND suddenly looks very attractive."
        ]);
    };

    const clear = () => {
        output.replaceChildren();
        line("NEVER LAND COMMUNICATION TERMINAL");
        line("Screen cleared. History, regrettably, remains.");
    };

    const quit = () => {
        lines([
            "You can check out any time you like.",
            "The terminal has no concept of leaving."
        ]);
    };

    const commandMap = new Map([
        ["help", showHelp],
        ["?", showHelp],
        ["look", look],
        ["l", look],
        ["look around", look],
        ["about", about],
        ["whoami", about],
        ["contact", contact],
        ["email", contact],
        ["e-mail", contact],
        ["mail", contact],
        ["send", send],
        ["inventory", inventory],
        ["inv", inventory],
        ["i", inventory],
        ["open hatch", openHatch],
        ["open service hatch", openHatch],
        ["take cable", takeCable],
        ["get cable", takeCable],
        ["take serial cable", takeCable],
        ["connect cable", connectCable],
        ["plug cable", connectCable],
        ["connect serial cable", connectCable],
        ["404", show404],
        ["source", show404],
        ["open 404", open404],
        ["visit 404", open404],
        ["read sign", readSign],
        ["read electronic sign", readSign],
        ["clear", clear],
        ["cls", clear],
        ["quit", quit],
        ["exit", quit]
    ]);

    const easterEggs = new Map([
        ["north", [
            "You go north.",
            "West of Chemist.",
            "Horizontal rain. Cheap sunglasses. This feels disturbingly familiar."
        ]],
        ["n", [
            "You go north.",
            "West of Chemist.",
            "Horizontal rain. Cheap sunglasses. This feels disturbingly familiar."
        ]],
        ["south", [
            "You go south.",
            "Booking Hall.",
            "The ticket counters are deserted. An electronic sign looks readable."
        ]],
        ["s", [
            "You go south.",
            "Booking Hall.",
            "The ticket counters are deserted. An electronic sign looks readable."
        ]],
        ["east", [
            "You go east.",
            "At The Chemist.",
            "Tiny envelopes. One voracious eye. You decide not to ask what is in stock."
        ]],
        ["e", [
            "You go east.",
            "At The Chemist.",
            "Tiny envelopes. One voracious eye. You decide not to ask what is in stock."
        ]],
        ["west", [
            "Brooding mountains occupy the western skyline.",
            "The weather is horizontal and the eyewear remains suspiciously cheap."
        ]],
        ["w", [
            "Brooding mountains occupy the western skyline.",
            "The weather is horizontal and the eyewear remains suspiciously cheap."
        ]],
        ["up", [
            "You climb higher than seems sensible.",
            "Above The Chemist.",
            "You are above the chemist, but all is not lost, although you are."
        ]],
        ["u", [
            "You climb higher than seems sensible.",
            "Above The Chemist.",
            "You are above the chemist, but all is not lost, although you are."
        ]],
        ["chemist", [
            "The chemist looks you up and down with one voracious eye.",
            "He seems unsurprised by static HTML."
        ]],
        ["sunglasses", [
            "Cheap sunglasses. Very cheap sunglasses.",
            "They appear to have parser-level plot armour."
        ]],
        ["cheap sunglasses", [
            "Cheap sunglasses. Very cheap sunglasses.",
            "They appear to have parser-level plot armour."
        ]],
        ["take off sunglasses", ["You can't take off the cheap sunglasses."]],
        ["remove sunglasses", ["You can't take off the cheap sunglasses."]],
        ["drop sunglasses", ["But you're still wearing the cheap sunglasses!"]],
        ["drum machine", [
            "A drum machine answers from somewhere beyond the parser.",
            "It is probably carrying the rhythm section by itself."
        ]],
        ["isabelle adjani", ["A picture briefly appears in your inventory, then thinks better of it."]],
        ["fake jazz nonsense", ["A deep aversion has been added to your inventory. It may already have been there."]],
        ["criminal city", ["No trains are currently operating to Criminal City. Consider EMAIL instead."]],
        ["slough of despond", ["Service to The Slough Of Despond is delayed indefinitely. Obviously."]],
        ["frotz", ["No Z-machine here. Vanilla JavaScript is doing an extremely committed impression."]],
        ["xyzzy", ["Nothing happens.", "A classic, though."]],
        ["plugh", ["A hollow voice says: 'wrong parser.'"]],
        ["sudo email", ["Nice try.", "This is GitHub Pages, not your shell."]],
        ["facebook", ["ERROR: WRONG DECADE."]],
        ["instagram", ["You feel strangely tired."]],
        ["tiktok", ["The terminal refuses to rotate vertically."]],
        ["icq", ["Uh-oh!"]],
        ["sisters", ["There is a faint sound of a drum machine somewhere in the distance."]],
        ["the sisters of mercy", ["There is a faint sound of a drum machine somewhere in the distance."]],
        ["floodland", [
            "A red sky forms briefly above the terminal.",
            "Somewhere in the static: we will never, never land."
        ]],
        ["never land", ["we will never, never land ::"]],
        ["peter pan", ["No."]],
        ["king of pop", ["HELL NO."]],
        ["hello", ["Hello.", "This is already more social interaction than the terminal expected."]],
        ["hi", ["Hello.", "This is already more social interaction than the terminal expected."]],
        ["fuck", ["PARSER ERROR: eloquent, but insufficiently specific."]],
        ["42", ["Correct answer. Wrong question."]],
        ["home", ["Home is ../index.html. The terminal declines to walk you there."]]
    ]);

    const execute = (rawCommand) => {
        const command = normalise(rawCommand);
        if (!command) return;

        history.push(rawCommand.trim());
        historyIndex = history.length;
        echo(rawCommand.trim());

        const mapped = commandMap.get(command);
        if (mapped) {
            mapped();
            return;
        }

        const egg = easterEggs.get(command);
        if (egg) {
            lines(egg);
            return;
        }

        if (command.startsWith("look at ") || command.startsWith("examine ") || command.startsWith("x ")) {
            const noun = command.replace(/^(look at|examine|x)\s+/, "");
            if (["terminal", "screen", "computer"].includes(noun)) {
                lines([
                    "A stubborn static-web terminal wearing a thin C64 disguise.",
                    "The font is much newer than the machine would like to admit."
                ]);
                return;
            }
            if (["cable", "serial cable"].includes(noun)) {
                line(state.cableTaken
                    ? "A serial cable. You are carrying it for reasons that seemed clearer a moment ago."
                    : "A serial cable on the floor. TAKE CABLE seems suspiciously obvious.");
                return;
            }
            if (["hatch", "service hatch"].includes(noun)) {
                line(state.hatchOpen
                    ? "The open hatch reveals a serial port and a heroic quantity of dust."
                    : "A small service hatch. It looks OPEN-able.");
                return;
            }
            if (["sign", "electronic sign"].includes(noun)) {
                readSign();
                return;
            }
            if (["sunglasses", "cheap sunglasses"].includes(noun)) {
                lines([
                    "A pair of cheap sunglasses.",
                    "You suspect removal has already been attempted repeatedly."
                ]);
                return;
            }
            if (["chemist"].includes(noun)) {
                lines(easterEggs.get("chemist"));
                return;
            }
        }

        lines([
            `I don't understand "${rawCommand.trim()}".`,
            "Type HELP for commands, or try being unnecessarily specific."
        ]);
    };

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const command = input.value;
        input.value = "";
        resizeInput();
        execute(command);
        input.focus();
    });

    input.addEventListener("input", resizeInput);

    input.addEventListener("keydown", (event) => {
        if (event.key === "ArrowUp") {
            event.preventDefault();
            if (!history.length) return;
            historyIndex = Math.max(0, historyIndex - 1);
            input.value = history[historyIndex] ?? "";
            resizeInput();
            input.setSelectionRange(input.value.length, input.value.length);
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!history.length) return;
            historyIndex = Math.min(history.length, historyIndex + 1);
            input.value = historyIndex === history.length ? "" : (history[historyIndex] ?? "");
            resizeInput();
            input.setSelectionRange(input.value.length, input.value.length);
        }
    });

    screen.addEventListener("click", (event) => {
        if (event.target.closest("a")) return;
        input.focus();
    });

    resizeInput();

    // Avoid forcing the mobile keyboard open on page load.
    if (window.matchMedia("(pointer: fine)").matches) {
        input.focus({ preventScroll: true });
    }
})();
