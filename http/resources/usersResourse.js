const usersIndex = async (resource) => {
  return {
    id: resource.id,
    first_name: resource.first_name,
    last_name: resource.last_name,
    email: resource.email,
    photo: resource.photo,
    email_verified_at: resource.email_verified_at,
    role: resource.role,
    created_at: resource.created_at,
    updated_at: resource.updated_at,
  }
}

const usersCollection = async (resources) => {
  let result = []
  for (let resource of resources) {
    result.push(await usersIndex(resource))
  }
  return result
}

module.exports = { usersIndex, usersCollection }
