# OnNight

On Night is an mobile application intended on helping students connect with Greek life social spaces better, allowing them to be notified about social events without having to rely on word of mouth.

## Dev site update

Most of the documentation for the dev site update can be found on the front end repo at https://github.com/dartmouth-cs52-21S/project-on-night. Although the backend has come very far. It now supports all of the necessary API endpoints/routes for both users and events. The users are simply displayed as it is now, although they will eventually have different permissions through authentication, and the events are also all displayed, although in the future, this will be in more of a calendar format. The back end has almost all of it's essential functionality, with the exception of authentication. Thanks!!

## Architecture

We followed a standard MERN stack. The frontend has been built with React Native for mobile functionality. The backend was built with Node, Express, and MongoDB, which allows our app to store and retrieve data as necessary. Other relevant tools/platforms include: Mailgun and Heroku. 

## Setup

Backend (local): clone the repository, run `npm install` to install the necessary dependencies, then run `npm start`
Backend (deployed): visit https://on-night-api.herokuapp.com/
Frontend (local): clone the repository, run `npm install` then `expo start`. The app can be viewed via links provided in the terminal or on your phone via the Expo app (QR code scan).
Frontend (deployed): refer to frontend repository instructions for further details 

## Deployment

The frontend will be deployed via the Expo store, refer to the frontend repo for more information. 
The backend has been deployed via Heroku at this [link](https://on-night-api.herokuapp.com/)

## Authors

* Ray Huang '21
* Maria Roodnitsky '22
* Aarnav Aggarwal '23
* Rishik Lad '23
* Will Toth'23 
