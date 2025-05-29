import { html, useState, useEffect, useRef } from "preact"
import useNavigation from "./useNavigation.js"
import useJSONLocalStorage from "./useLocalStorage.js"
import Modal from "./Modal.js"

const BigTextsListItem = ({ text, onChange, onEdit, onDelete }) => {
  return html`
    <div className="mt-5 rounded-full bg-stone-600 p-2">
      <div className="flex">
        <span onClick=${() => navigate("show", { bigText: text.content })} className="grow px-2"
          >${text.content.replace(/<br\s*\/?>/gi, "⏎")}</span
        >
        <div className="ml-auto flex gap-2">
          <button
            title="Favorite ${text.isFavorite ? '-' : '+'}"
            type="button"
            className="cursor-pointer border-none bg-none"
            onClick=${() => onChange({ isFavorite: !text.isFavorite })}
          >
            ${text.isFavorite ? "⭐️" : "☆"}
          </button>
          <button title="Edit text" type="button" className="cursor-pointer border-none bg-none" onClick=${onEdit}>
            ✏️
          </button>
          <button title="Delete text" type="button" className="cursor-pointer border-none bg-none" onClick=${onDelete}>
            🗑️
          </button>
        </div>
      </div>
    </div>
  `
}

const BigTextsList = ({ texts, setTexts }) => {
  const [isFormOpen, setFormOpen] = useState(false)
  const [bigText, setBigText] = useState(null)

  const openModal = (currentBigText) => {
    setBigText(currentBigText)
    setFormOpen(true)
  }

  const deleteItem = (index) => {
    const updated = [...texts]
    updated.splice(index, 1)
    setTexts(updated)
  }

  const updateText = ({ index, newText }) => {
    const updated = [...texts]
    updated[index] = { ...updated[index], ...newText }
    setTexts(updated)
  }

  return html`
    ${texts.map(
      (text, index) =>
        html`<${BigTextsListItem}
          text=${text}
          onEdit=${() => openModal({ index, text })}
          onDelete=${() => deleteItem(index)}
          onChange=${(changes) => updateText({ index, newText: changes })}
        />`,
    )}
    ${isFormOpen &&
    bigText &&
    html`
      <${Modal}
        isOpen="${isFormOpen}"
        onSubmit="${(newText) => updateText({ index: bigText.index, newText })}"
        onClose=${() => setFormOpen(false)}
        bigText=${bigText.text}
      />
    `}
  `
}
const [setItems, getItems] = useJSONLocalStorage("texts")

const App = () => {
  const [isFormOpen, setFormOpen] = useState(false)
  const [texts, setTexts] = useState(getItems())

  useEffect(() => setItems(texts), [texts])

  const submitForm = (text) => {
    setItems([text, ...texts])
    setFormOpen(false)
    navigate("show", { bigText: text.content })
  }

  return html`
    <div className="flex h-screen justify-center p-2">
      <div className="flex w-full flex-col sm:w-1/2 lg:w-1/3">
        <div className="flex text-left">
          <h3>My BIG texts</h3>
          <div hidden="${!texts.length}" className="ml-auto">
            <button type="button" className="cursor-pointer" onClick=${() => setTexts([])}>
              Clear History 🔥
            </button>
          </div>
        </div>
        <div className="grow overflow-y-auto">
          ${texts.length
            ? html`<${BigTextsList} texts=${texts} setTexts=${setTexts} />`
            : html`
                <div className="mt-10 flex flex-col items-center">
                  <h3 className="font-bold">You have no Big Texts yet</h3>
                  <button type="button" className="cursor-pointer" onClick=${() => setFormOpen(!isFormOpen)}
                    >Add new now</span
                  >
                </div>
              `}
        </div>
        <button
          type="button"
          className="cursor-pointer bg-stone-500 py-2 rounded-full"
          onClick=${() => setFormOpen(!isFormOpen)}
        >
          Add BIG TEXT NOW
        </button>
        <${Modal}
          isOpen="${isFormOpen}"
          onSubmit="${submitForm}"
          onClose=${() => setFormOpen(false)}
        />
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
      ref=${bigTextDisplayRef}
      className="flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-stone-700 p-4"
    >
      <button
        onClick=${() => navigate("")}
        className="absolute top-0 left-0 cursor-pointer border-none bg-none p-5 text-white"
      >
        ×
      </button>
      <button
        className="absolute right-0 bottom-0 cursor-pointer border-none bg-none p-5 text-white"
        onClick=${toggleFullScreen}
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
