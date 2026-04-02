# Textify

A modern web-based Optical Character Recognition (OCR) application that extracts text from images locally in the browser, allowing users to organize extracted blocks and export them as formatted PDF documents.


---


## Tech Stack


- **Frontend:** React, TypeScript, Vite, Tailwind CSS
  
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-CF4281?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)  

- **Core Engines:** Tesseract.js, dnd-kit, jsPDF  

- **Backend:** Firebase Authentication, Google Cloud Firestore
  
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)


---


## Features


- **Local AI Extraction:** Uses WebAssembly to process images directly in the browser.  

- **Intelligent Guest Mode:** Frictionless local state caching for non-authenticated users.  

- **Mobile Canvas Compression:** Intercepts large camera roll uploads to prevent memory crashes.  

- **Flexible Stack Reordering:** Collision-optimized drag and drop for block organization.  

- **Selective PDF Export:** Stitch specific blocks into a downloadable document.  

- **Serverless Cloud Sync:** Authenticated users can save document history.


---


## Environment Variables


Create a `.env` file and add the following:

## Environment Variables


To run this project, you will need to add the following environment variables to your .env file


`VITE_FIREBASE_API_KEY`


`VITE_FIREBASE_AUTH_DOMAIN`


`VITE_FIREBASE_PROJECT_ID`


`VITE_FIREBASE_STORAGE_BUCKET`


`VITE_FIREBASE_MESSAGING_SENDER_ID`


`VITE_FIREBASE_APP_ID`


## Run Locally


Clone the project


```bash

git clone [https://github.com/gnbaba/Textify.git](https://github.com/gnbaba/Textify.git)

```

Install Dependencies

```bash
npm install

```

Start server

```bash
npm run dev

```

## Live Demo

https://textify-ocr-vision.vercel.app/app
