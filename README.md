# StraySense
A project for Stray animals

To run the project, go to branch named tuaha-new
Download the zip file and extract it

Go to Database folder and run the StraySense.sql file script in MySQL Workbench
Change the localhost and password to yours in Backend folder in merged-server.js file

Then open the project file in VSCode and Open terminal and run these commands,

cd Frontend
npm install
npm start

Then open a new terminal and run these commands

cd Backend
npm init -y
npm install express bcryptjs jsonwebtoken dotenv mongoose cors
node merged-server.js
