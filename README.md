# Trafikkamera

Bygdebladet si vising av trafikkamera frå Statens vegvesen.

## GitHub Pages

Publiser frå `main` og vel `/ (root)` i Pages-innstillingane. Sida brukar statiske filer og treng ingen byggjekommando.

## Innbygging i nettavisa

Lim inn heile blokka i HTML-feltet i artikkelen.

```html
<div data-bb-trafikk>
  <iframe
    src="https://leffernan.github.io/Trafikkamera/"
    title="Bygdebladet Trafikk"
    height="780"
    style="display:block;width:100%;border:0;background:#F7F3E9"
  ></iframe>
</div>
<script src="https://leffernan.github.io/Trafikkamera/embed-host.js" defer></script>
```

Skriptet etter iframe-en tilpassar høgda og let biletvindauget bruke heile skjermen, slik kampvindauga i lokalfotballen og handballen gjer. Med berre iframe-en opnar biletvindauget inne i ramma.
