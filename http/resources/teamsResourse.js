const teamsIndex = async (resource, params) => {
  const local = params
  if (Array.isArray(resource)) {
    return teamsCollection(resource, local)
  }
  return {
    id: resource.id,
    firstName: resource.firstName,
    lastName: resource.lastName,
    image: resource.image,
    images: resource.images ? JSON.parse(resource.images) : resource.images,
    rank: resource.rank ? tr(JSON.parse(resource.rank), local) : resource.rank,
    title: resource.title
      ? tr(JSON.parse(resource.title), local)
      : resource.title,
    description: resource.description
      ? tr(JSON.parse(resource.description), local)
      : resource.description,
    active: resource.active,
    created_at: resource.created_at,
    updated_at: resource.updated_at,
  }
}

const teamsCollection = async (resources, params) => {
  let result = []
  for (let resource of resources) {
    result.push(await teamsIndex(resource, params))
  }
  return result
}

module.exports = { teamsIndex, teamsCollection }
