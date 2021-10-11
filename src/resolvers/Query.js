const login1 = async (parent, args, context) => {
    const exist = await context.prisma.user.findUnique({
        where: {
            email: args.email
        }
    });
    if (!exist) throw new Error("Usuario inexistente");
    if (args.password === exist.password) {
        return exist;
    }
    throw new Error("Contaseña equivocada");
};

const todosUser = async (parent, args, context) => {
    if (!context.datosUser) throw new Error('User no authenticado');
    return await context.prisma.todo.findMany({
        where: {
            userId: args.idUser ? args.idUser : context.datosUser.userId,
        },
        include: {
            user: true,
        }
    });
};

const listUsersGrupo = async (parent, args, context) => {
    if (!context.datosUser) throw new Error('User no authenticado');
    return await context.prisma.user.findMany({
        where: {
            grupoId: context.datosUser.grupoId,
            /*id: {
                not: context.userId,
            }*/
        },
        include: {
            todos: true,
        }
    });
};

module.exports = {
    login1,
    todosUser,
    listUsersGrupo
};
