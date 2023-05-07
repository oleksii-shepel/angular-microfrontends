# Angular Micro Frontend Example

This repository shows you how to set up micro frontends using Webpack 5 and Module Federation plugin in Angular.

**Prerequisites**

* Node 20
* Angular CLI 16
* GitHub account

## Getting Started

To run this example, run the following commands:

```bash
git clone https://github.com/oleksii-shepel/microfrontends.git
cd microfrontends
npm i
npm run run:all
```

### Recreate this starter

You can recreate this starter project structure yourself. Here are the central Angular CLI, npm, and shell commands. The commands to add Tailwind CSS and each Angular component is skipped.

```shell
npx @angular/cli@13 new angular-microfrontend-example --create-application false --minimal
cd angular-microfrontend-example
ng generate application shell --routing --style css --inline-style
ng generate component products --project shell
ng generate component products/product --project shell --flat
ng generate library shared
ng generate interface product --project shared
ng generate service products --project shared
ng generate service basket --project shared

ng generate application basket --routing --style css --inline-style
ng generate component home --project basket
ng generate module basket --project basket --routing --route basket --module app

ng add @angular-architects/module-federation --project shell --port 4200
ng add @angular-architects/module-federation --project basket --port 4201
...
```