const index = async (resourse) => {
  return {
    id: resourse.id,
    first_name: resourse.first_name,
    last_name: resourse.last_name,
    email: resourse.email,
    photo: resourse.photo,
    email_verified_at: resourse.email_verified_at,
    role: resourse.role,
    created_at: resourse.created_at,
    updated_at: resourse.updated_at,
  }
}

const collection = async (resource) => {
  let aArr = []
  for (const res of resource) {
    aArr.push(await index(res))
  }
  return aArr
}

const userResource = async (resource = {}, params = {}) => {
  if (Array.isArray(resource)) {
    return collection(resource)
  }
  return index(resource)
}

module.exports = userResource
