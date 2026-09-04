const KEY = 'metalcalc:recipes'

export function loadRecipes() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function saveRecipe(recipe) {
  const recipes = loadRecipes()
  recipes.push(recipe)
  localStorage.setItem(KEY, JSON.stringify(recipes))
  return recipes
}

export function deleteRecipe(label) {
  const recipes = loadRecipes().filter((r) => r.label !== label)
  localStorage.setItem(KEY, JSON.stringify(recipes))
  return recipes
}
