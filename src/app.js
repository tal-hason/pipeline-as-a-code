var image = process.env.IMAGE
var tag = process.env.TAG
var host = process.env.HOSTNAME
var port = process.env.PORT || 8080;
var express = require('express');
const path = require('path');
const fs = require('fs'); // Add this line to require the 'fs' module
const Prometheus = require('prom-client');
const register = new Prometheus.Registry();

app = express();

register.setDefaultLabels({
  app: 'hello-world Nodejs application'
})
Prometheus.collectDefaultMetrics({register})


const http_request_counter = new Prometheus.Counter({
  name: 'myapp_http_request_count',
  help: 'Count of HTTP requests made to my app',
  labelNames: ['method', 'route', 'statusCode'],
});
register.registerMetric(http_request_counter);


   
// Health Probe - Application Liveliness
app.get('/health/liveliness',function(req,res){
  console.log(`I am Alive`)
  res.status(200)
  res.send('Healty')
});
    
// Health Probe - Application Readiness
app.get('/health/readiness',function(req,res){
  console.log(`I am Ready`)
  res.status(200);
  res.send('Ready');
  });  

  app.get('/', function (req, res) {
    
    var clientHostname = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
    // Use the 'sendFile' method to send the HTML file as a response
    res.sendFile(__dirname + '/html/index.html');
  
    console.log(`Someone accessed me! --> from ${clientHostname}`)
  });


// Define a route to serve images by name
app.get('/image/:imageName', function (req, res) {
  const imageName = req.params.imageName; // Get the image name from the URL parameter
  const imagePath = path.join(__dirname, 'img', imageName);
  console.log(`Requested image: ${imageName}`);
  // Check if the image file exists
  if (fs.existsSync(imagePath)) {
    // Set the content type based on the image file extension
    const contentType = getContentType(imageName);
    console.log(`Serving image: ${imageName}`);
    res.contentType(contentType);

    // Use 'sendFile' to serve the image
    res.sendFile(imagePath);
  } else {
    // Return a 404 error if the image does not exist
    console.log(`Image not found: ${imageName}`);
    res.status(404).send('Image not found');
  }
});

// Function to determine content type based on file extension
function getContentType(imageName) {
  const extension = path.extname(imageName);
  switch (extension) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    // Add more cases for other image formats as needed
    default:
      return 'application/octet-stream';
  }
}


app.get('/test1', function (req, res) {

  res.send(`This is Test1, All Good`);

  console.log(`Someone accessed Test1 Path!`)
});

app.get('/test2', function (req, res) {

  res.send(`This is Test2, All Good`);

  console.log(`Someone accessed Test2 Path!`)
});

app.get('/metrics', function(req, res)
{
    res.setHeader('Content-Type',register.contentType)

    register.metrics().then(data => res.status(200).send(data))
});

app.use(function(req, res, next)
{
    // Increment the HTTP request counter
    http_request_counter.labels({method: req.method, route: req.originalUrl, statusCode: res.statusCode}).inc();

    next();
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});

