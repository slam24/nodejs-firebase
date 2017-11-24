import * as admin from "firebase-admin";
import express from 'express';
import fs from 'fs';
import path from 'path';
import * as serviceAccount from "./serviceAccountKey.json";

const app = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://###.firebaseio.com"
});

app.get('/', (req, res) => {
  res.send('Running.');
});

function listAllUsers(nextPageToken) {
  // List batch of users, 1000 at a time.
  admin.auth().listUsers(10, nextPageToken)
  .then(function(listUsersResult) {
    listUsersResult.users.forEach(function(userRecord) {
      console.log("user", userRecord.toJSON().uid);
      admin.auth().deleteUser(userRecord.toJSON().uid)
      .then(function() {
        console.log("Successfully deleted user");
      })
      .catch(function(error) {
        console.log("Error deleting user:", error);
      });
    });
    if (listUsersResult.pageToken) {
        // List next batch of users.
        listAllUsers(listUsersResult.pageToken)
      }
    })
  .catch(function(error) {
    console.log("Error listing users:", error);
  });
}
// Start listing users from the beginning, 1000 at a time.

app.get('/deleteusers', (req, res) => {
  res.send('Running.');
  listAllUsers();
});

app.listen(3000, () =>{
  console.log('Running at port 3000');
});