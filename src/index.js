import { html, useState, useEffect, useRef } from "preact"
import useNavigation from "./useNavigation.js"

const BigTextsListItem = ({ text, onChange }) => {
  const toggleIsFavorite = () => onChange({ isFavorite: !text.isFavorite })

  return html`
    <div className="mt-5 rounded-full bg-stone-600 p-2">
      <div className="flex">
        <span onClick="${() => navigate("show", { bigText: text.content })}" className="grow px-2"
          >${text.content.replace(/<br\s*\/?>/gi, "⏎")}</span
        >
        <div className="ml-auto flex gap-1">
          <button className="cursor-pointer border-none bg-none text-white">✏️</button>
          <button
            className="cursor-pointer border-none bg-none text-white"
            onClick="${toggleIsFavorite}"
          >
            ${text.isFavorite ? "⭐️" : "☆"}
          </button>
        </div>
      </div>
    </div>
  `
}

const EmptyBigTextsList = ({ onAddTextClick }) => html`
  <div className="mt-10 flex flex-col items-center">
    <h3 className="font-bold">You have no Big Texts yet</h3>
    <span className="cursor-pointer" onClick="${onAddTextClick}">Add new now</span>
  </div>
`

const BigTextForm = ({ bigTextRef, onSubmit }) => {
  const isMobileOrTablet = () =>
    /Mobi|Android|iPhone|iPad|iPod|Tablet|Mobile/i.test(navigator.userAgent)

  const submitForm = () => {
    onSubmit({
      content: bigTextRef.current.innerHTML,
      isFavorite: false,
    })
  }
  const onKeyPress = (e) => {
    if (!isMobileOrTablet() && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submitForm()
    }
  }

  return html`
    <div className="mt-5 flex flex-col justify-center rounded-full bg-stone-500 p-2">
      <div className="flex">
        <span
          className="flex items-center justify-center cursor-pointer border-none bg-none px-2 text-white"
          onClick="${() => (bigTextRef.current.textContent = "")}"
          >×</span
        >
        <div className="grow" contenteditable ref="${bigTextRef}" onKeyPress="${onKeyPress}"></div>
        <div className="flex items-center justify-center ml-auto">
          <button
            className="cursor-pointer border-none bg-none px-2 text-white"
            onClick="${submitForm}"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  `
}

const getInitialTexts = () => {
  try {
    return JSON.parse(localStorage.getItem("texts")) || []
  } catch (e) {
    console.warn("Corrupted localStorage:", e)
    return []
  }
}

const App = () => {
  const [texts, setTexts] = useState(getInitialTexts)
  const bigTextRef = useRef(null)
  const updateTextsLS = (newTexts) => localStorage.setItem("texts", JSON.stringify(newTexts))

  useEffect(() => {
    if (!texts.length) bigTextRef.current?.focus()
  }, [])

  useEffect(() => updateTextsLS(texts), [texts])

  const updateText = (index, newText) => {
    const updated = [...texts]
    updated[index] = { ...updated[index], ...newText }
    setTexts(updated)
  }

  const submitForm = (text) => {
    updateTextsLS([text, ...texts])
    navigate("show", { bigText: text.content })
  }

  return html`
    <div className="flex h-screen justify-center p-2">
      <div className="flex w-full flex-col sm:w-1/2 lg:w-1/3">
        <div className="flex text-left">
          <h3>My BIG texts</h3>
          <div hidden="${!texts.length}" className="ml-auto">
            <button className="cursor-pointer" onClick=${() => setTexts([])}>Clear History</button>
          </div>
        </div>
        <div className="grow overflow-y-auto">
          ${texts.length
            ? texts.map(
                (t, i) =>
                  html`<${BigTextsListItem}
                    text=${t}
                    onChange="${(changes) => updateText(i, changes)}"
                  />`,
              )
            : html`<${EmptyBigTextsList} onAddTextClick="${() => bigTextRef.current?.focus()}" />`}
        </div>
        ${html`<${BigTextForm} bigTextRef="${bigTextRef}" onSubmit="${submitForm}" />`}
      </div>
    </div>
  `
}

const BigText = () => {
  const bigText = new URLSearchParams(location.search).get("bigText")
  const bigTextDisplayRef = useRef(null)
  const bigTextRef = useRef(null)

  const fontSize = () => {
    bigTextRef.current.style.fontSize = "100px"

    const widthScale = bigTextDisplayRef.current.clientHeight / bigTextRef.current.scrollHeight
    const heightScale = bigTextDisplayRef.current.clientWidth / bigTextRef.current.scrollWidth

    const scaleFactor = Math.min(widthScale, heightScale)
    return Math.round(100 * scaleFactor)
  }

  const onResize = () => {
    bigTextRef.current.style.fontSize = `${fontSize()}px`
  }

  useEffect(() => {
    if (bigTextRef.current && bigTextDisplayRef.current) {
      bigTextRef.current.style.fontSize = `${fontSize()}px`
    }

    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => {
    bigTextRef.current.style.fontSize = `${fontSize()}px`
  }, [bigText])

  const openFullscreen = (elem) => {
    elem.requestFullscreen?.() || elem.webkitRequestFullscreen?.() || elem.msRequestFullscreen?.()
  }

  const closeFullscreen = () => {
    document.exitFullscreen?.() ||
      document.webkitExitFullscreen?.() ||
      document.msExitFullscreen?.()
  }

  const toggleFullScreen = () =>
    !document.fullscreenElement ? openFullscreen(bigTextDisplayRef.current) : closeFullscreen()

  return html`
    <div
      ref="${bigTextDisplayRef}"
      className="flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-stone-700 p-4"
    >
      <button
        onClick="${() => navigate("")}"
        className="absolute top-0 left-0 cursor-pointer border-none bg-none p-5 text-white"
      >
        ×
      </button>
      <button
        className="absolute right-0 bottom-0 cursor-pointer border-none bg-none p-5 text-white"
        onClick="${toggleFullScreen}"
      >
        ⛶
      </button>
      <p
        ref=${bigTextRef}
        class="text-center leading-none font-bold"
        dangerouslySetInnerHTML=${{ __html: bigText }}
      ></p>
    </div>
  `
}

const [navigate, renderRoute, handleRedirect] = useNavigation({
  "/": App,
  "/show": BigText,
})

handleRedirect()
renderRoute()

window.addEventListener("popstate", renderRoute)
