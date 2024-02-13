const { translate } = require("../../components/globalFunctions")

const index = async (resourse, localParams) => {
  const {
    id,
    first_name,
    last_name,
    image,
    images,
    rank,
    title,
    description,
    active,
    created_at,
    updated_at,
  } = resourse

  return {
    id,
    first_name,
    last_name,
    image,
    images: images ? JSON.parse(images) : images,
    rank: rank ? translate(JSON.parse(rank), localParams) : rank,
    title: title ? translate(JSON.parse(title), localParams) : title,
    description: description
      ? translate(JSON.parse(description), localParams)
      : description,
    active,
    created_at,
    updated_at,
  }
}

const collection = async (resource) => {
  let aArr = []
  for (let res of resource) {
    aArr.push(await index(res))
  }
  return aArr
}

const teamsResource = async (resource = {}, localParams = {}) => {
  // localParams =>>> ?? conf.lang.default ?? null;
  if (Array.isArray(resource)) {
    return collection(resource)
  }
  return index(resource, localParams)
}

module.exports = teamsResource
