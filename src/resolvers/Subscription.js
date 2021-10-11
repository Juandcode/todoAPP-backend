const {withFilter} = require("graphql-subscriptions");
const addTodo = {
    subscribe: withFilter((a, b, c) => c.pubSub.asyncIterator(['ADD_TODO']),
        (payload, variables) => {
            return (payload.addTodo.user.grupoId === variables.groupId);
        },
    ),
};

module.exports = {
    addTodo,
}
