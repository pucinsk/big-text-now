const useJSONLocalStorage = (key) => {
  const setItems = (newItems) => localStorage.setItem(key, JSON.stringify(newItems))
  const getItems = () => {
    try {
      return JSON.parse(localStorage.getItem(key)) || []
    } catch (e) {
      console.warn("Corrupted localStorage:", e)
      return []
    }
  }
  return [setItems, getItems]
}

export default useJSONLocalStorage
