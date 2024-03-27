# Description

CRUD Admin panel. This is a web service that showcase login + CRUD

# Tech Stack

- Nest.js
- TypeScript
- Zod
- MySQL
- Prisma

# How to run locally

## Prerequisites

- Node.js: install guide [here](https://nodejs.org/en/download/package-manager)
- Yarn: install guide [here](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable)

## Steps

1. Install dependencies. In terminal run: `yarn install`
2. Create .env file in root directory. Then copy paste the contents of .env.example. This will load 1 variables that is used to determine the DATABASE URL. For your convenience, right now it is pointing to the production database. You don't need to run the setup database locally
3. Start development server. In terminal run: `yarn start:dev`

# Deployment

This API is deployed in [Railway](https://railway.app)

## How to deploy

This repo is connected to Railways's CI/CD. Any git push to main branch will trigger a redeploy

## Deployment URL

Link: https://admin-crud-six.vercel.app/login
