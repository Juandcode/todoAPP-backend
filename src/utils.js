const jwt = require('jsonwebtoken');

const getDatosUser = req => {
        //console.log(req.headers);
        if (req && req.headers) {
            if (req && req.headers.authorization) {
                const token = req.headers.authorization.replace('Bearer ', '');
                try {
                    const {userId, grupoId} = jwt.verify(token, 'HOLAMUNDO');
                    console.log(userId);
                    return {userId, grupoId};
                } catch {
                    //throw new Error('Token invalido');
                    return null;
                }
            }
        }
        if (req && req.authorization) {
            const token = req.authorization.replace('Bearer ', '');
            try {
                const {userId, grupoId} = jwt.verify(token, 'HOLAMUNDO');
                console.log(userId);
                return {userId, grupoId};
            } catch {
                //throw new Error('Token invalido');
                return null;
            }
        }
        //throw new Error('Token invalido');
        return null;
    };

module.exports = {
    getDatosUser,
}
