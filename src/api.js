const fs = require('fs');

// Module variables
var data = {};
var datafile = "";

/** @function handleRequest
  * This function maps incoming requests to
  * API calls.
  * @param {http.clientRequest} req - the incoming request
  * @param {http.serverResponse} res - the response to serve
  */
function handleRequest(req, res) {
  if(req.method === 'POST' && req.url === '/courses') {
    return createCourse(req, res);
  } else if(req.method === 'GET' && req.url === '/courses') {
      return readCourses(req, res);
  } else if(req.method === 'GET' && /^(\/courses\/)[0-9, a-z]+$/.test(req.url)) {
      return readCourse(req, res);
  } else if(req.method === 'PUT' && /^(\/courses\/)[0-9, a-z]+$/.test(req.url)) {
      return updateCourse(req, res);
  } else if(req.method === 'DELETE' && /^(\/courses\/)[0-9, a-z]+$/.test(req.url)) {
      return deleteCourse(req, res);
  } else {
    res.statusCode = 400;
    res.end("Not implemented");
  }
}

function readCourses(req, res) {
  res.statusCode = 200;
  var courses = [];
  for (var courseID in data['courses']) {
    courses.push(data['courses'][courseID]);
  }
  res.end(JSON.stringify(courses));
}

function readCourse(req, res) {
    var id = req.url.substring(req.url.lastIndexOf('/')+1);
    if (!data["courses"].hasOwnProperty(id)) {
        res.statusCode = 422;
        res.end("Invalid ID");
      return;
    }
    res.statusCode = 200;
    res.end(JSON.stringify(data["courses"][id]));
}

function updateCourse(req, res) {
    var id = req.url.substring(req.url.lastIndexOf('/')+1);
    if (!data["courses"].hasOwnProperty(id)) {
        res.statusCode = 422;
        res.end("Invalid ID");
        return;
    }

    var jsonString = "";

    req.on('data', function(chunk) {
        jsonString += chunk;
    });

    req.on('error', function(err) {
        console.error(err);
        res.statusCode = 500;
        res.end("Server Error");
    });

    req.on('end', function(){
        try {
            data["courses"][id] = JSON.parse(jsonString);
            save();
            res.statusCode = 200;
            res.end(id);
        } catch (err) {
            console.error(err);
            res.statusCode = 500;
            res.end("Server Error: " + err);
        }
    });
}

function deleteCourse(req, res) {
    var id = req.url.substring(req.url.lastIndexOf('/')+1);
    if (!data["courses"].hasOwnProperty(id)) {
        res.statusCode = 422;
        res.end("Invalid ID");
        return;
    }
    delete data["courses"][id];
    save();
    res.statusCode = 200;
    res.end();
}

function createCourse(req, res) {
  var jsonString = "";

  req.on('data', function(chunk) {
    jsonString += chunk;
  });

  req.on('error', function(err) {
    console.error(err);
    res.statusCode = 500;
    res.end("Server Error");
  });

  req.on('end', function(){
    try {
      var course = JSON.parse(jsonString);
      var tokens = course.name.split(" ");
      if(tokens.length < 2) {
        res.statusCode = 422;
        res.end("Poorly formatted course entry");
        return;
      }
      var id = tokens[0] + tokens[1];
      data["courses"][id] = course;
      save();
      res.statusCode = 200;
      res.end(id);
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.end("Server Error: " + err);
    }
  });
}

/** @function load
  * Loads the persistent data file
  * @param {string} filename - the file to load
  */
function load(filename) {
  datafile = filename;
  data = JSON.parse(fs.readFileSync(filename, {encoding: "utf-8"}));
}

/** @function save
  * Saves the data to the persistent file
  */
function save() {
  fs.writeFileSync(datafile, JSON.stringify(data));
}

/** @module API
  * A module implementing a REST API
  */
module.exports = {
  load: load,
  handleRequest: handleRequest
}
