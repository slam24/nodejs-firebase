/*jshint esversion: 6 */

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
        //console.log("Error deleting user:", error);
      });
    });
    if (listUsersResult.pageToken) {
        // List next batch of users.
        listAllUsers(listUsersResult.pageToken);
      }
    })
  .catch(function(error) {
    //console.log("Error listing users:", error);
  });
}

function clearTable(table) {
  admin.database().ref(table).limitToLast(10).on("value", function(snapshot) {
    for (var uid in snapshot.val()) {
      console.log(uid)
      admin.database().ref().child(table+'/' + uid + '/').remove();
    }
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
}

app.get('/deleteusers', (req, res) => {
  res.send('Running.');
  listAllUsers();
});

app.get('/deletesessions', (req, res) => {
  res.send('Running.');
  clearTable("sessions");
});

app.listen(3000, () =>{
  console.log('Running at port 3000');
});