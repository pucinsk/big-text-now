import { html, useEffect, useRef } from "preact"
import { isDesktop } from "./utils.js"

const Modal = ({ isOpen, onClose, onSubmit }) => {
  const bigTextRef = useRef(null)

  const cancel = () => {
    reset()
    close()
  }

  const close = () => {
    onClose()
  }

  const submit = () => {
    onSubmit({
      content: bigTextRef.current.innerHTML,
      isFavorite: false,
    })
  }

  const reset = () => {
    bigTextRef.current.innerHTML = ""
  }

  const onKeyPress = (e) => {
    if (isDesktop()) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        submit()
      }

      if (e.key === "Escape") {
        e.preventDefault()
        close()
      }
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        close()
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  return html`
    <dialog
      open=${isOpen}
      onReset=${reset}
      onSubmit=${submit}
      onClose=${close}
      className="open:flex w-screen h-screen inset-0 m-auto items-center justify-center bg-black/20 backdrop-blur-md text-white"
    >
      <form method="dialog" className="flex w-full flex-col sm:w-1/2 lg:w-1/3">
        <div className="mt-5 flex flex-col justify-center rounded-full bg-stone-500 p-2">
          <button
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
            <div
              className="grow"
              contenteditable="true"
              ref=${bigTextRef}
              onKeyPress=${onKeyPress}
            />
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
