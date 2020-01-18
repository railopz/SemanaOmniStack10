const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');

module.exports = {
    async index(request, response) {
        const devs = await Dev.find();

        return response.json(devs);
    },

    async store(request, response)  {
        const { github_username, techs, latitude, longitude } = request.body;

        let dev = await Dev.findOne({ github_username });

        if(!dev) {
            const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);
        
            const {name = login, avatar_url, bio } = apiResponse.data;
        
            const techsArray = parseStringAsArray(techs);
        
            const location  = {
                type: 'Point',
                coordinates: [longitude, latitude],
            }
        
            dev = await Dev.create({
                github_username,
                name,
                avatar_url,
                bio,
                techs: techsArray,
                location
            });
        }
    
        
    
        return response.json(dev);
    },

    async update(request, response) {
        const { 
            name,
            avatar_url,
            bio,
            techs,
            latitude,
            longitude } = request.body
            
          let techsArray = ''
          let location = ''
          let objForUpdate = {};
          
          const user = await Dev.findById(request.params.id);
          
          if (!user) return res.status(400).json({ error: 'User does not exixts' })
          
          if(techs) {
            techsArray = parseStringAsArray(techs)
          }
          
          if(latitude && longitude) {
            location = {
              type: 'Point',
              coordinates: [longitude, latitude]
            }
          }
          
          //const { avatar_url } = await axios.get(`https://api.github.com/users/${user.github_username}`)
          
          if (name) objForUpdate.name = name;
          if (avatar_url) objForUpdate.avatar_url = avatar_url;
          if (bio) objForUpdate.bio = bio;
          if (techsArray) objForUpdate.techs = techsArray;
          if (location) objForUpdate.location = location;
          
          objForUpdate = { $set: objForUpdate }
          
          await Dev.updateOne(objForUpdate)
          
          return response.json({ ok: true});

    },

    async destroy(request, response) {
        
        // recebendo o nome do usuário
        const { github_username } = request.params;

        // Verificando se o usuário existe na base de dados
        let dev = await Dev.findOne({github_username});

        if(!dev) {
            return response.status(400).json({ message: "Usuário não encontrado!" });
        }

        // excluido usuário
        await Dev.deleteOne({github_username});

        return response.status(200).json({ message: "Usuário excluido com sucesso!" });
          
    },
}