# Then and Now

*Deconstructing and overcoming PTSD.*

A private guide in five stages for people living with post-traumatic stress disorder (PTSD): how it works, the steps that the best-tested treatments use, and tools for hard moments. It follows the form of *The Journey*: for each stage, what went in, how it works, and a path of eight steps. Every key claim carries an evidence grade and a link to its source.

**Open it:** https://fco-cyber.github.io/then-and-now/ (once published; see `DEPLOY.md`)

A self-help guide, not therapy, diagnosis or treatment. Version 3 (23 November 2026) changes only how the passphrase box is marked: it is a lock for this device, not a website password, so browsers are asked not to save it. Everything a person writes stays in their own browser: there is no server, no account and no tracking. Evidence reviewed to 17 November 2026.

## Install it on your device

Once installed, Then and Now opens like any other app, works without internet, and keeps itself up to date.

- **iPhone or iPad:** open the link in Safari, tap the Share button (the square with an arrow pointing up), then choose **Add to Home Screen**.
- **Android:** open the link in Chrome and tap **Install** when it's offered, or open the ⋮ menu and choose **Install app** (on some phones, **Add to Home screen**).
- **Mac:** in Safari, open the **File** menu and choose **Add to Dock**. In Chrome or Edge, click the install icon at the right-hand end of the address bar.
- **Windows or Chromebook:** in Chrome or Edge, click the install icon at the right-hand end of the address bar, or use the browser menu's install option.

Inside the app, **Colours and display › On this device** shows whether the offline copy is saved, offers **Install** where the browser allows it, and has a **Share this app** button.

## Updates

New versions reach every device by themselves. Whenever Then and Now is opened with an internet connection, it loads the latest version and saves it for offline use. If it's already open when a new version is published, a small bar offers **Refresh**. What people have written is stored separately from the app and is never touched by an update.

## Publishing a new version

1. Claude prepares the update: the new version's file goes into `versions/`, and `index.html`, `sw.js` and `version.json` are rebuilt from it by `tools/build_site.py`.
2. On GitHub, open the repository, choose **Add file › Upload files**, and drag in the updated files (dragging in everything again is fine too: unchanged files are simply left as they are).
3. Press **Commit changes** (a commit is GitHub's word for saving a change). About a minute later the new version is live.

The file in `versions/` is never altered, so it still works when it's opened straight from a folder on a computer. Only the current version is kept online; earlier versions stay in the app's folder on Marcus's computer.

## What's in this repository

A repository is a project's folder on GitHub, with every past change kept. This one is published as a website with GitHub Pages, GitHub's free website hosting.

| File or folder | What it is |
|---|---|
| `index.html` | The live app: the newest version, with the install and offline features added |
| `sw.js` | The service worker: a small background script that keeps the offline copy and picks up new versions |
| `pwa.js` | The install, share and update features inside the app |
| `manifest.webmanifest` | The app's name, colours, icons and shortcuts, used when it's installed |
| `version.json` | Which version is live |
| `icons/` and `screenshots/` | App icons, install previews, and the picture shown when the link is shared |
| `versions/` | The current version of the app as one self-contained file |
| `tools/` | `build_site.py`, which prepares an update, and the service worker's template |
| `source/` | The app's source code in separate modules, and `build.py`, which joins them into one file for `versions/` |
| `DEPLOY.md` | Step-by-step instructions for putting the site online and publishing updates |
| `LICENSE` | The licence: CC BY-NC-SA 4.0 |

## Credits

Typefaces: Newsreader and Atkinson Hyperlegible, both under the SIL Open Font Licence, embedded in the app. The PTSD Checklist for DSM-5 (PCL-5) was developed by the US National Center for PTSD and is in the public domain. Medallion artwork follows *The Journey* series.
