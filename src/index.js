            const {ApolloServer} = require('apollo-server-express');
const express = require('express');
const fs = require('fs');
const path = require('path');
const {makeExecutableSchema} = require('@graphql-tools/schema');

const {execute, subscribe} = require('graphql');
const {SubscriptionServer} = require('subscriptions-transport-ws');
const {PubSub} = require('graphql-subscriptions');

const {PrismaClient} = require('@prisma/client')
const resolvers = require('./resolvers');

const {getDatosUser} = require('./utils');
const http = require("http");

const starApolloServer = async () => {
    const prisma = new PrismaClient();
    const app = express();
    const httpServer = http.createServer(app);
    //const http2 = app.listen(4000);
    const pubSub = new PubSub();

    const schema = makeExecutableSchema({
        typeDefs: fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8'),
        resolvers
    })

    const server = new ApolloServer({
        schema,
        dataSources: () => ({
            //prisma,
        }),
        context: ({req}) => {
            return {
                ...req,
                pubSub,
                prisma,
                datosUser:
                getDatosUser(req),
            }
        },
    });

    await server.start();
    server.applyMiddleware({
        app,
        path: '/'
    });

    SubscriptionServer.create({
        schema,
        execute,
        subscribe,
        onConnect: (connectionParams, webSocket, context) => {
            // context.prisma = prisma;
            console.log(connectionParams);
            const datosUser = getDatosUser(connectionParams);
            //throw new Error('Token invalido');
            return {datosUser,prisma};
        },
        onOperation: (message, params, webSocket) => {
            params.context.pubSub = pubSub;
            //params.context.prisma = prisma;
            return params;
        },
    }, {server: httpServer, path: '/'});

    //app.listen(4000, () => console.log('graphql server on'));
    httpServer.listen(3000, () => {
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
        console.log(`🚀 Subscriptions ready at ws://localhost:`);
    });


};

(async()=> starApolloServer())();
