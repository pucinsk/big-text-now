import { html, render, useState, useEffect, useRef } from "preact";

function BigTextsListItem({ text }) {
  return html`
    <div class="bg-stone-600 rounded-full w-100 grow my-5 p-2">
      <div class="flex items-center gap-1 px-1">
        <span>${text.content}</span>
        <div class="flex ml-auto gap-1">
          <button class="bg-none border-none text-white cursor-pointer">
            ✏️
          </button>
          <button class="bg-none border-none text-white cursor-pointer">
            ${text.isFavorite ? "⭐️" : "☆"}
          </button>
        </div>
      </div>
    </div>
  `;
}

function EmptyBigTextsList() {
  return html`
    <div class="flex flex-col items-center mt-10">
      <h3 class="font-bold">You have no Big Texts yet</h3>
      <p>Add new now</p>
    </div>
  `;
}

function Dashboard({ bigText, setBigText, navigator }) {
  const initialTexts = (() => {
    const textsJson = localStorage.getItem("texts");
    if (textsJson) {
      return JSON.parse(textsJson);
    }
    return [];
  })();

  const [texts, setTexts] = useState(initialTexts);
  const bigTextRef = useRef(null);

  const clearHistory = () => {
    setTexts([]);
    localStorage.removeItem("texts");
  };

  const resetForm = () => {
    setBigText("");
    if (bigTextRef.current) {
      bigTextRef.current.textContent = "";
    }
  };

  const submitForm = () => {
    const text = {
      content: bigText,
      isFavorite: false,
    };
    localStorage.setItem("texts", JSON.stringify([text, ...texts]));
    navigator.bigText();
  };

  return html`
    <div class="h-screen flex flex-col items-center">
      <div class="overflow-y-auto flex-1 w-100 my-5">
        <div class="flex text-left">
          <h3>My BIG texts</h3>
          ${!!texts.length &&
          html`
            <div class="ml-auto">
              <button class="cursor-pointer" onClick=${() => clearHistory()}>
                Clear History
              </button>
            </div>
          `}
        </div>
        ${!!texts.length
          ? texts.map((t) => html`<${BigTextsListItem} text=${t} />`)
          : html`<${EmptyBigTextsList} />`}
      </div>

      <div class="w-100 bg-stone-500 rounded-full my-5 p-4">
        <input type="hidden" name="big-text" />
        <div class="flex items-center gap-1">
          <span
            class="bg-none border-none text-white cursor-pointer px-1"
            onClick="${resetForm}"
            >×</span
          >
          <div
            class="grow"
            contenteditable
            ref="${bigTextRef}"
            onInput="${(e) => setBigText(e.target.textContent)}"
          ></div>
          <div class="ml-auto">
            <button
              class="bg-none border-none text-white cursor-pointer px-2"
              onClick="${submitForm}"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function BigText({ bigText, navigator }) {
  const bigTextDisplayRef = useRef(null);
  const bigTextRef = useRef(null);
  const [bigTextFontSize, setBigTextFontSize] = useState(100);

  const fontSize = () => {
    bigTextRef.current.style.fontSize = "100px";
    const scaleFactor =
      bigTextDisplayRef.current.clientWidth / bigTextRef.current.scrollWidth;
    return Math.round(100 * scaleFactor);
  };

  const onResize = () => {
    bigTextRef.current.style.fontSize = `${fontSize()}px`;
  };

  useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    bigTextRef.current.style.fontSize = `${fontSize()}px`;
  }, [bigText]);

  function openFullscreen(elem) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE11 */
      elem.msRequestFullscreen();
    }
  }

  function closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      /* IE11 */
      document.msExitFullscreen();
    }
  }

  const toggleFullScreen = () =>
    !document.fullscreenElement
      ? openFullscreen(bigTextDisplayRef.current)
      : closeFullscreen();

  return html`
    <div
      ref="${bigTextDisplayRef}"
      class="w-full h-screen flex flex-col justify-center items-center overflow-hidden p-4 bg-stone-700"
    >
      <button
        onClick="${navigator.dashboard}"
        class="absolute top-0 left-0 bg-none border-none text-white cursor-pointer p-5"
      >
        ×
      </button>
      <button
        class="absolute bottom-0 right-0 bg-none border-none text-white cursor-pointer p-5"
        onClick="${toggleFullScreen}"
      >
        ⛶
      </button>
      <p ref="${bigTextRef}" class="text-center font-bold leading-none">
        ${bigText}
      </p>
    </div>
  `;
}

function App() {
  const [bigText, setBigText] = useState("dashboard");
  const [currentPage, setCurrentPage] = useState("dashboard");
  const navigator = {
    dashboard: () => {
      setCurrentPage("dashboard");
    },
    bigText: () => {
      setCurrentPage("bigText");
    },
  };

  if (currentPage === "bigText") {
    return html`<${BigText} bigText="${bigText}" navigator="${navigator}" />`;
  }

  return html`
    <${Dashboard}
      bigText="${bigText}"
      setBigText="${setBigText}"
      navigator="${navigator}"
    />
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  render(html`<${App} />`, document.body);
});
