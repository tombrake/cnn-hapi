'use strict';



/*
 * Example application that uses cnn-hapi as a dependency to provide a basic
 * Hapi server with built in features that this example doesn't need to care
 * about.
 *
 * See the comments inline for changes that would be typical in an external app
 */
const path = require('path'),
    hapi = require('../init'), // hapi = require('cnn-hapi'),
    cnnhealth = require('cnn-health'),
    otherChecks = require('./config/otherchecks');



let healthChecks = cnnhealth(path.resolve(__dirname, './config/healthcheck')).asArray(),
    app, io, server = hapi({
        basePath: __dirname,
        customHeaders: [{
            name: 'Connection',
            value: 'close'
        }],
        description: 'A Test Harness for building CNN-HAPI',
        envProd: 'prod',
        healthChecks: healthChecks.concat(otherChecks),
        helpersPath: 'handlebars/helpers',
        layoutsDir: 'views',
        maxAge: '10',
        maxListeners: 1000,
        metrics: {
            provider: require('cnn-metrics'),
            options: {flushEvery: (6 * 1000)}
        },
        name: 'testHarness',
        partialsPath: 'handlebars/partials',
        port: process.env.PORT,
        surrogateCacheControl: 'max-age=60, stale-while-revalidate=10, stale-if-error=6400',
        withSwagger: true,
        withGoodConsole: true,
        withHandlebars: true
    });



/* get the hapi server */
app = server.hapi;



io = require('socket.io')(app.listener);



/* listen on any event and fire socket io events */
io.on('connection', (socket) => {
    app.onemit('log', (data) => {
        socket.send(data);
    });
});



/* set the application routes */
app.route(require('./routes'));



app.start(function serverStart() {
    console.log('info', `Server running at ${app.info.uri}`);
    console.log('info', `Server name: ${server.name}`);
    console.log('info', `Server version: ${server.version}`);
    console.log('info', `Server maxListeners: ${server.maxListeners}`);
    console.log('info', `Server environment: ${server.env}`);
    console.log('info', `Server in debug mode: ${server.isDebug}`);
});
