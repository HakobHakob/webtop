const { DB } = require("../../components/db")

const settingsIndex = async (resource, params) => {
  const local = params
  if (Array.isArray(resource)) {
    return collection(resource, local)
  }
  return {
    id: resource.id,
    key: resource.key,
    name: resource.name ? tr(JSON.parse(resource.name), local) : resource.name,
    description: resource.description
      ? tr(JSON.parse(resource.description), local)
      : resource.description,
    value: resource.value ? JSON.parse(resource.value) : resource.value,
    type: resource.type,
    image: resource.image,
    images: resource.images ? JSON.parse(resource.images) : resource.images,
    active: resource.active,
    created_at: resource.created_at,
    updated_at: resource.updated_at,
  }
}

const settingsCollection = async (resources, params) => {
  let result = []
  for (let resource of resources) {
    result.push(await settingsIndex(resource, params))
  }
  return result
}

module.exports = { settingsIndex, settingsCollection }
