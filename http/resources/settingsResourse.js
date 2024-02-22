const { translate } = require("../../components/globalFunctions")

const index = async (resourse, params) => {
  // params =>>>>>  conf.lang.default ?? null;
  const { id, key, name, description, value,file, active, created_at, updated_at } =
    resourse
  return {
    id,
    key,
    name,
    description: description
      ? translate(JSON.parse(description), params)
      : description,
    value,
    file,
    active,
    created_at,
    updated_at,
  }
}

const collection = async (resource) => {
  let aArr = []
  for (const res of resource) {
    aArr.push(await this.index(res))
  }
  return aArr
}

const settingsResources = (resource = {}, params = {}) => {
  if (Array.isArray(resource)) {
    return collection(resource)
  }
  return index(resource, params)
}

module.exports = settingsResources
