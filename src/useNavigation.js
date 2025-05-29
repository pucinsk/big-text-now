import { html, render } from "preact"

const getPathPrefix = () => (location.origin.includes("github.io") ? "/big-text-now" : "")

const buildPath = (path) => `${getPathPrefix()}/${path}`
const pathname = () => location.pathname.replace(getPathPrefix(), "")

const useNavigation = (routes) => {
  const renderRoute = () => {
    const routeComponent = routes[pathname()]
    render(
      routeComponent ? html`<${routeComponent} />` : html`<h1>404 - Page not found</h1>`,
      document.body,
    )
  }

  const navigate = (path, params = {}) => {
    const url = new URL(buildPath(path), location.origin)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
    history.pushState({}, "", url)
    renderRoute()
  }

  const handleRedirect = () => {
    const params = new URLSearchParams(location.search)
    const redirectedPath = params.get("redirect")

    if (redirectedPath) {
      history.replaceState(null, "", redirectedPath)
    }
  }

  return [navigate, renderRoute, handleRedirect]
}

export default useNavigation
