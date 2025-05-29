import { html, useEffect, useRef } from "preact"
import { isDesktop } from "./utils.js"

const Modal = ({ isOpen, onClose, onSubmit, bigText } = { bigText: null }) => {
  const bigTextRef = useRef(null)

  const reset = () => {
    if (bigTextRef.current) bigTextRef.current.innerHTML = ""
  }

  const cancel = () => {
    reset()
    onClose()
  }

  const submit = () => {
    const content = bigTextRef.current?.innerHTML?.trim()
    if (content) {
      onSubmit({ content, isFavorite: false })
    } else {
      cancel()
    }
  }

  const handleEnter = (e) => {
    if (isDesktop() && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  useEffect(() => {
    if (!isOpen) return
    if (bigText) bigTextRef.current.innerHTML = bigText.content

    const handleEscape = (e) => e.key === "Escape" && cancel()
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  return html`
    <dialog
      open=${isOpen}
      onReset=${reset}
      onSubmit=${submit}
      onClose=${onClose}
      className="open:flex w-screen h-screen inset-0 m-auto items-center justify-center bg-black/20 backdrop-blur-md text-white"
    >
      <form method="dialog" className="flex w-full flex-col sm:w-1/2 lg:w-1/3">
        <div className="mt-5 flex flex-col justify-center rounded-full bg-stone-500 p-2">
          <button
            type="button"
            onClick=${cancel}
            className="absolute top-0 left-0 cursor-pointer border-none bg-none p-5"
          >
            ×
          </button>
          <div className="flex">
            <button
              type="reset"
              className="flex items-center justify-center cursor-pointer border-none bg-none px-2"
            >
              ×
            </button>
            <div className="grow" contenteditable ref=${bigTextRef} onKeyPress=${handleEnter} />
            <div className="flex items-center justify-center ml-auto">
              <button type="submit" className="cursor-pointer border-none bg-none px-2 text-white">
                ➤
              </button>
            </div>
          </div>
        </div>
      </form>
    </dialog>
  `
}

export default Modal
