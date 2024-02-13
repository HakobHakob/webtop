const { translate } = require("../../components/globalFunctions")
const { conf } = require("../../config/app_config")

const collection = async (resource) => {
  let aArr = []
  for (let res of resource) {
    aArr.push(await this.index(res))
  }
  return aArr
}

const index = async (resourse, params) => {
  // params =>>>>>  conf.lang.default ?? null;
  const {
    id,
    key,
    name,
    description,
    value,
    type,
    image,
    images,
    active,
    created_at,
    updated_at,
  } = resourse
  return {
    id,
    key,
    name: name ? translate(JSON.parse(name), params) : name,
    description: description
      ? translate(JSON.parse(description), params)
      : description,
    value: value ? JSON.parse(value) : value,
    type,
    image,
    images: images ? JSON.parse(images) : images,
    active,
    created_at,
    updated_at,
  }
}
const settingsResources = (resource = {}, params = {}) => {
  if (Array.isArray(resource)) {
    return collection(resource)
  }
  return index(resource, params)
}

module.exports = settingsResources
