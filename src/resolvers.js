const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
const Subscription = require('./resolvers/Subscription');

const resolvers = {
    Query,
    Mutation,
    Subscription,
};

module.exports = resolvers;
