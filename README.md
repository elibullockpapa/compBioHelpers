# Computational Biology Helpers

Visit the deployed website: <a href="https://comp-bio-helpers.vercel.app/" target="_blank" rel="noopener noreferrer">Comp Bio Helpers</a>

‘AlignFlow’ is an interactive web application designed to streamline and demystify complex biological algorithms, namely, the calculation of BLOSUM matrices and global alignment of biological sequences. Addressing the limitations of existing tools, our platform provides intuitive interfaces for BLOSUM matrix calculation, a 2D global alignment tool, and, most notably, a novel implementation of an interactive 3D global alignment algorithm. By extending the principles of the Needleman-Wunsch algorithm into a third dimension, we created a unique visual tool that simplifies multi-sequence alignment. Developed using React and Next.js for the frontend, and incorporating Three.js for the interactive 3D visualizations, "AlignFlow" transforms traditionally opaque processes into accessible and engaging computational tools. This paper details the design, implementation, and technical architecture of the application, highlighting its potential for enhancing education and research in computational biology. 

The application is developed using the following technologies:
Frontend: React and Next.js
3D Visualization: Three.js




To install the node modules, run this command in your terminal:
```bash
npm install
```
To run in dev mode, run this command in your terminal:
```bash
npm run dev
```
To create a docker image, run this command in your terminal:
```bash
docker build -t "name of your image" .
```
To run the docker container, run this command in your terminal:
```bash
docker run -p "port":3000 "name of your image"
```
