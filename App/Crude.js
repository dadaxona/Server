const { Server } = require('../models')
class Crude
{
    async get ()
    {
        try {
            const result = await Server.findAll()
            const jsonData = result.map(r => r.toJSON())
            return { statusCode: 200, items: jsonData }
        } catch (error) {
            return { statusCode: 404, msg: error }
        }
    }

    async create (data)
    {
        try {
            await Server.create(data)
            return { statusCode: 200 }
        } catch (error) {
            return { statusCode: 404, msg: error }
        }
    }

    async update (data)
    {
        try {
            await Server.update(data, {where: {id: data.id}})
            return { statusCode: 200 }
        } catch (error) {
            return { statusCode: 404, msg: error }
        }
    }

    async destroy (data)
    {
        try {
            await Server.destroy({where: {id: data.id}})
            return { statusCode: 200 }
        } catch (error) {
            return { statusCode: 404, msg: error }
        }
    }
}

module.exports = new Crude();