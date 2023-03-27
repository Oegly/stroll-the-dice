export const getLevel = () => {
  return Number.parseInt(window.localStorage.getItem("level")) || 0;
}

export const getMaxLevel = () => {
  return Number.parseInt(window.localStorage.getItem("maxLevel")) || 0;
}

export const setLevel = (level: number) => {
  // Store highest level
  if (level > getMaxLevel()) {
    window.localStorage.setItem("maxLevel", level.toString());
  }

  window.localStorage.setItem("level", level.toString());
}
