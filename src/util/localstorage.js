const put = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data))
};

const get = (key) => {
  return (null === localStorage.getItem(key)) ? null : ("undefined" === localStorage.getItem(key)) ? null : JSON.parse(localStorage.getItem(key))
};

const existKey = (key) => {
  return localStorage.hasOwnProperty(key)
}

const remove = (key) => {
  localStorage.removeItem(key)
};

const clear = () => {
  localStorage.clear()
};

export {put, get, remove, existKey, clear};