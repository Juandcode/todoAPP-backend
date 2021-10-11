const jwt = require('jsonwebtoken');
const createUser = async (parent, args, context) => {

    const exist = await context.dataSources.prisma.user.findUnique({
        where: {
            email: args.email,
        },
    });
    if (exist) throw new Error('Usuario existente');
    return await context.dataSources.prisma.user.create({
        data: {
            nombre: args.nombre,
            email: args.email,
            password: args.password,
        },
    });
};
const login = async (parent, args, context) => {
    const exist = await context.prisma.user.findUnique({
        where: {
            email: args.email
        }
    });
    if (!exist) throw new Error("Usuario inexistente");
    if (args.password === exist.password) {
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            userId: exist.id,
            grupoId: exist.grupoId,
        }, 'HOLAMUNDO');
        return {...exist, token};
    }
    throw new Error("Contaseña equivocada");
};

const createTodoItem = async (parent, args, context) => {
        /*return await context.dataSources.prisma.todo.create({
            data: {
                nombre: args.nombre,
                completado: false,
                eliminado: false,
                user: {
                    connect: {
                        id: args.idUser,
                    },
                }
            }
        });*/
        if (!context.datosUser) throw new Error('error en la authenticacion');

        const data = await context.prisma.todo.create({
            data: {
                nombre: args.nombre,
                completado: false,
                eliminado: false,
                user: {connect: {id: args.userId ? args.userId : context.datosUser.userId}}
            },
            include: {
                user: true,
            }
        });
        await context.pubSub.publish('ADD_TODO', {
            addTodo: data,
        });
        return data;
    }
;

const changeGroupUser = async (parent, args, context) => {
    return await context.prisma.user.update({
        where: {id: args.userId},
        data: {
            grupo: {
                connect: {id: args.grupoId}
            }
        }
    })
};

const completeTodo = async (parent, args, context) => {
    if (!context.datosUser) throw new Error('error en la authenticacion');
    const data = await context.prisma.todo.update({
        where: {id: args.id},
        data: {
            completado: args.completado
        },
        include: {
            user: true,
        }
    });
    await context.pubSub.publish('ADD_TODO', {
        addTodo: data,
    });
    return data;
};

const deleteTodo = async (parent, args, context) => {
    if (!context.datosUser) throw new Error('error en la authenticacion');
    const data = await context.prisma.todo.delete({
        where: {id: args.id},
        include: {
            user: true,
        }
    });
    await context.pubSub.publish('ADD_TODO', {
        addTodo: data,
    });
    return data;
}

module.exports = {
    createUser,
    createTodoItem,
    changeGroupUser,
    login,
    completeTodo,
    deleteTodo
}
