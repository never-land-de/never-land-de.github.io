# Gaming data

## Current

`data/gaming.json` is the static source of truth for Gaming platform profiles and Memory Alpha entries.

## Future Steam

A server-side Steam API integration or external importer can later update the static library, recently played, playtime, level and badge data. The API key must never be exposed in browser code.

## Future Twitch

Twitch Helix can later feed the static snapshot through an external importer or GitHub Action. The client secret must never be exposed in browser code.

## Xbox

Xbox remains a manually maintained snapshot for now.
