var roleSchema = require('../schemas/role')

module.exports={
    GetAllRole: async ()=>{
        return await roleSchema.find({});
    },
    GetRoleById:async (id)=>{
        return await roleSchema.findById(id);
    },
    GetRoleByName:async (name)=>{
        return await roleSchema.findOne({
            name:name
        });
    },
    CreateRole: async (name)=>{
        let newRole = new roleSchema({
            name:name
        });
        return await newRole.save()
    }

}