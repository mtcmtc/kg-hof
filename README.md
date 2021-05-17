# tw21-kg

This is the Kevin Garnett hall of fame repo.

## Get started

Clone this repo...

```bash
git clone https://github.com/wolveslynx/tw21-kg.git
```

Install the dependencies...

```bash
cd tw21-kg
npm install
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see your app running. Edit components in `src`, save it, and reload the page to see your changes.

## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`.

## Deploying to the web

You will want to copy all budle files (specifically `bundle.js`, `bundle.css`) in the `build` folder and overwrite the files in the project folder on AWS. It will help to version up the url reference in the Drupal publish page.
