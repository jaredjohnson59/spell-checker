To run spell checker scanner go to the cmd, go to Spell Checker folder (in the cmd) and enter following:

node scanner -a {dictionary code} -b {mongodb database name} -c {mongodb collection name} -d {siteid}

Example:
node scanner -a en_US -b spell-checker -c sites -d 1
 
a- = dictionary code
b- = mongodb name
c- = mongodb collection name
d- = siteid

Once the scanner has been run go to the cmd, go to Spell Checker folder (in the cmd) and enter following:

node server

This will start up a localhost webpage on port 3001.

Port number can be changed by edit the following line in the server.js file:
app.listen(3001);

Once the app has started go to your web browser of choice and enter:

localhost:3001