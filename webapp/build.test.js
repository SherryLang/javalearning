var fs = require('fs');
var path = require('path');
var testfiles = []
var basePath = '.\\src\\components\\'
var getAllTestFile = function (path) {
    var files = fs.readdirSync(path);
    for (fn in files) {
        var fname = path + files[fn];
        var stat = fs.statSync(fname);
        if (stat.isDirectory() == true) {
            getAllTestFile(fname + "\\");
        }
        else {
            if (fname.endsWith("\\demo.js")) {
                var lastPath = fname.replace(basePath, "").replace("\\demo.js", "").replace(/\\/g, '/');
                var lastName = lastPath.substr(lastPath.indexOf("/") + 1);
                lastName = lastName.substr(0, lastName.indexOf("/"));
                lastName = lastName.substring(0, 1).toUpperCase() + lastName.substring(1);
                testfiles.push({name: lastName, path: lastPath})
            }
        }
    }
}
getAllTestFile(basePath);
var outputFilename = './src/conf/components.json';
var writer = function (outputFileName) {
    fs.writeFile(outputFileName, JSON.stringify(testfiles, null, 4), function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved to " + outputFileName);
        }
    });
};
writer(outputFilename);