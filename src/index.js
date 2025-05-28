import { html, render, useState, useEffect, useRef } from "preact"

function BigTextsListItem({ text }) {
  return html`
    <div class="mt-5 rounded-full bg-stone-600 p-2">
      <div class="flex items-center gap-1 px-1">
        <span>${text.content}</span>
        <div class="ml-auto flex gap-1">
          <button class="cursor-pointer border-none bg-none text-white">✏️</button>
          <button class="cursor-pointer border-none bg-none text-white">
            ${text.isFavorite ? "⭐️" : "☆"}
          </button>
        </div>
      </div>
    </div>
  `
}

function EmptyBigTextsList() {
  return html`
    <div class="mt-10 flex flex-col items-center">
      <h3 class="font-bold">You have no Big Texts yet</h3>
      <p>Add new now</p>
    </div>
  `
}

function BigTextForm({ onSubmit, onChange }) {
  const bigTextRef = useRef(null)

  const resetForm = () => {
    onChange("")
    if (bigTextRef.current) {
      bigTextRef.current.textContent = ""
    }
  }

  return html`
    <div class="mt-5 flex flex-col justify-center rounded-full bg-stone-500 p-2">
      <input type="hidden" name="big-text" />
      <div class="flex">
        <span class="cursor-pointer border-none bg-none px-2 text-white" onClick="${resetForm}"
          >×</span
        >
        <div
          class="grow"
          contenteditable
          ref="${bigTextRef}"
          onInput="${(e) => onChange(e.target.textContent)}"
        ></div>
        <div class="ml-auto">
          <button class="cursor-pointer border-none bg-none px-2 text-white" onClick="${onSubmit}">
            ➤
          </button>
        </div>
      </div>
    </div>
  `
}

function App() {
  const initialTexts = (() => {
    const textsJson = localStorage.getItem("texts")
    if (textsJson) {
      return JSON.parse(textsJson)
    }
    return []
  })()

  const [bigText, setBigText] = useState("")
  const [texts, setTexts] = useState(initialTexts)

  const clearHistory = () => {
    setTexts([])
    localStorage.removeItem("texts")
  }

  const submitForm = () => {
    const text = {
      content: bigText,
      isFavorite: false,
    }
    localStorage.setItem("texts", JSON.stringify([text, ...texts]))
    navigate("show", { bigText: bigText })
  }

  return html`
    <div class="flex h-screen justify-center">
      <div class="flex w-full flex-col sm:w-1/2 lg:w-1/3">
        <div class="flex text-left">
          <h3>My BIG texts</h3>
          <div hidden="${!texts.length}" class="ml-auto">
            <button class="cursor-pointer" onClick=${() => clearHistory()}>Clear History</button>
          </div>
        </div>
        ${texts.length
          ? texts.map((t) => html`<${BigTextsListItem} text=${t} />`)
          : html`<${EmptyBigTextsList} />`}
        ${html`<${BigTextForm} onSubmit="${submitForm}" onChange=${setBigText} />`}
      </div>
    </div>
  `
}

function BigText() {
  const [bigText, setBigText] = useState("")
  const bigTextDisplayRef = useRef(null)
  const bigTextRef = useRef(null)

  useEffect(() => {
    const url = new URL(location)
    const params = Object.fromEntries(url.searchParams)
    setBigText(params.bigText)
  }, [location])

  const fontSize = () => {
    bigTextRef.current.style.fontSize = "100px"
    const scaleFactor = bigTextDisplayRef.current.clientWidth / bigTextRef.current.scrollWidth
    return Math.round(100 * scaleFactor)
  }

  const onResize = () => {
    bigTextRef.current.style.fontSize = `${fontSize()}px`
  }

  useEffect(() => {
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => {
    bigTextRef.current.style.fontSize = `${fontSize()}px`
  }, [bigText])

  function openFullscreen(elem) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if (elem.webkitRequestFullscreen) {
      /* Safari */
      elem.webkitRequestFullscreen()
    } else if (elem.msRequestFullscreen) {
      /* IE11 */
      elem.msRequestFullscreen()
    }
  }

  function closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      /* Safari */
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      /* IE11 */
      document.msExitFullscreen()
    }
  }

  const toggleFullScreen = () =>
    !document.fullscreenElement ? openFullscreen(bigTextDisplayRef.current) : closeFullscreen()

  return html`
    <div
      ref="${bigTextDisplayRef}"
      class="flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-stone-700 p-4"
    >
      <button
        onClick="${() => navigate("")}"
        class="absolute top-0 left-0 cursor-pointer border-none bg-none p-5 text-white"
      >
        ×
      </button>
      <button
        class="absolute right-0 bottom-0 cursor-pointer border-none bg-none p-5 text-white"
        onClick="${toggleFullScreen}"
      >
        ⛶
      </button>
      <p ref="${bigTextRef}" class="text-center leading-none font-bold">${bigText}</p>
    </div>
  `
}

const routes = {
  "/": App,
  "/show": BigText,
}

const buildPath = (path) => {
  if (location.origin.includes("github.io")) {
    return `/big-text-now/${path}`
  } else {
    return path
  }
}

const pathname = () => {
  if (location.origin.includes("github.io")) {
    return location.pathname
      .split("/")
      .filter((s) => s != "big-text-now")
      .join("/")
  } else {
    return location.pathname
  }
}

function navigate(path, params = {}) {
  const url = new URL(buildPath(path), location.origin)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  history.pushState({}, "", url)
  renderRoute()
}

function renderRoute() {
  const routeComponent = routes[pathname()]
  if (routeComponent) {
    render(html`<${routeComponent} />`, document.body)
  } else {
    render(html`<h1>404 - Page not found</h1>`, document.body)
  }
}

const params = new URLSearchParams(location.search)
const redirectedPath = params.get("redirect")

if (redirectedPath) {
  history.replaceState(null, "", redirectedPath)
}

document.addEventListener("popstate", renderRoute)
renderRoute()
