import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "https://ritam-uf3b.onrender.com";

const drugs = {
  metformin: {
    name: "Metformin",
    type: "Oral medicine",
    theme: "amber",
    description:
      "Explore your medicine, ask questions, and understand information from the approved drug document.",
  },

  amoxicillin: {
    name: "Amoxicillin",
    type: "Antibiotic",
    theme: "blue",
    description:
      "Explore your medicine, ask questions, and understand information from the approved drug document.",
  },

  cetirizine: {
    name: "Cetirizine",
    type: "Antihistamine",
    theme: "violet",
    description:
      "Explore your medicine, ask questions, and understand information from the approved drug document.",
  },
};

const journeyMeta = {
  why: {
    number: "01",
    label: "WHY",
    icon: "◉",
  },

  how: {
    number: "02",
    label: "HOW",
    icon: "→",
  },

  watch: {
    number: "03",
    label: "WATCH",
    icon: "◌",
  },

  warn: {
    number: "04",
    label: "WARN",
    icon: "!",
  },

  food: {
    number: "05",
    label: "FOOD",
    icon: "⌁",
  },

  missed_dose: {
    number: "06",
    label: "MISSED DOSE",
    icon: "↻",
  },
};


/* =========================================================
   APP
========================================================= */

function App() {
  const [page, setPage] = useState("home");
  const [drug, setDrug] = useState("metformin");
  const [mode, setMode] = useState("patient");

  const currentDrug = useMemo(
    () => drugs[drug],
    [drug]
  );

  useEffect(() => {
    document.documentElement.dataset.theme =
      currentDrug.theme;
  }, [currentDrug.theme]);

  const navigate = (nextPage) => {
    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const selectDrug = (value) => {
    setDrug(value);
    setPage("medicine");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="app-shell">

      <CosmosBackground />

      {page !== "home" && (
        <Sidebar
          page={page}
          drug={drug}
          currentDrug={currentDrug}
          navigate={navigate}
          selectDrug={selectDrug}
        />
      )}

      <main
        className={
          page === "home"
            ? "main-content home-main"
            : "main-content"
        }
      >

        {page !== "home" && (
          <Topbar
            currentDrug={currentDrug}
            drug={drug}
            setDrug={setDrug}
            navigate={navigate}
          />
        )}

        {page === "home" && (
          <Home
            drug={drug}
            selectDrug={selectDrug}
          />
        )}

        {page === "medicine" && (
          <MedicineHome
            currentDrug={currentDrug}
            navigate={navigate}
          />
        )}

        {page === "chat" && (
          <AskRitam
            currentDrug={currentDrug}
            drug={drug}
            mode={mode}
            setMode={setMode}
          />
        )}

        {page === "journey" && (
          <MedicationJourney
            currentDrug={currentDrug}
            drug={drug}
          />
        )}

        {page === "heard" && (
          <HeardPage
            currentDrug={currentDrug}
            drug={drug}
          />
        )}

        {page === "evidence" && (
          <EvidencePage
            currentDrug={currentDrug}
            drug={drug}
          />
        )}

      </main>
    </div>
  );
}


/* =========================================================
   COSMOS BACKGROUND
========================================================= */

function CosmosBackground() {
  const stars = Array.from(
    { length: 45 },
    (_, index) => ({
      id: index,
      left: `${(index * 37) % 100}%`,
      top: `${(index * 67) % 100}%`,
      size: `${1 + (index % 3)}px`,
      delay: `${(index % 9) * 0.7}s`,
      duration: `${4 + (index % 6)}s`,
    })
  );

  return (
    <div className="cosmos-background">

      <div className="cosmos-nebula nebula-one"></div>
      <div className="cosmos-nebula nebula-two"></div>
      <div className="cosmos-nebula nebula-three"></div>

      <div className="cosmos-stars">
        {stars.map((star) => (
          <span
            key={star.id}
            className="cosmos-star"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>

      <div className="cosmos-noise"></div>
    </div>
  );
}


/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  page,
  drug,
  currentDrug,
  navigate,
  selectDrug,
}) {
  const navigation = [
    {
      id: "medicine",
      label: "My Medicine",
      icon: "⌂",
    },
    {
      id: "chat",
      label: "Ask Ritam",
      icon: "◌",
    },
    {
      id: "journey",
      label: "Medication Journey",
      icon: "◎",
    },
    {
      id: "heard",
      label: "I Heard...",
      icon: "⌁",
    },
    {
      id: "evidence",
      label: "Evidence",
      icon: "▤",
    },
  ];

  return (
    <aside className="sidebar">

      <button
        className="brand"
        onClick={() => navigate("home")}
      >
        <img
          src="/ritam-logo.png"
          alt="Ritam"
          className="brand-logo"
        />

        <div>
          <div className="brand-name">
            RITAM
          </div>

          <div className="brand-subtitle">
            AI medication companion
          </div>
        </div>
      </button>

      <div className="sidebar-section">

        <div className="sidebar-label">
          EXPLORE
        </div>

        {navigation.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${
              page === item.id ? "active" : ""
            }`}
            onClick={() => navigate(item.id)}
          >
            <span className="nav-icon">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </button>
        ))}

      </div>

      <div className="sidebar-bottom">

        <div className="sidebar-label">
          CURRENT MEDICINE
        </div>

        <select
          className="sidebar-drug-select"
          value={drug}
          onChange={(event) =>
            selectDrug(event.target.value)
          }
        >
          <option value="metformin">
            Metformin
          </option>

          <option value="amoxicillin">
            Amoxicillin
          </option>

          <option value="cetirizine">
            Cetirizine
          </option>
        </select>

        <div className="sidebar-current-drug">

          <div className="drug-mini-orb">
            {currentDrug.name.charAt(0)}
          </div>

          <div>
            <strong>{currentDrug.name}</strong>

            <span>
              {currentDrug.type}
            </span>
          </div>

        </div>

      </div>

    </aside>
  );
}


/* =========================================================
   TOPBAR
========================================================= */

function Topbar({
  currentDrug,
  drug,
  setDrug,
  navigate,
}) {
  return (
    <header className="topbar">

      <div className="breadcrumb">

        <button
          onClick={() => navigate("home")}
        >
          Ritam
        </button>

        <span>/</span>

        <span>{currentDrug.name}</span>

      </div>

      <div className="topbar-actions">

        <select
          className="topbar-drug-select"
          value={drug}
          onChange={(event) =>
            setDrug(event.target.value)
          }
        >
          <option value="metformin">
            Metformin
          </option>

          <option value="amoxicillin">
            Amoxicillin
          </option>

          <option value="cetirizine">
            Cetirizine
          </option>
        </select>

        <div className="status-pill">

          <span className="status-dot"></span>

          Evidence grounded

        </div>

      </div>

    </header>
  );
}


/* =========================================================
   HOME
========================================================= */

function Home({
  drug,
  selectDrug,
}) {
  const [hoveredDrug, setHoveredDrug] = useState(null);

  const [pointer, setPointer] = useState({
    x: 0,
    y: 0,
  });

  const activeDrug =
    drugs[hoveredDrug || drug];

  const handlePointerMove = (event) => {
    const bounds =
      event.currentTarget.getBoundingClientRect();

    const x =
      ((event.clientX - bounds.left) /
        bounds.width -
        0.5) *
      2;

    const y =
      ((event.clientY - bounds.top) /
        bounds.height -
        0.5) *
      2;

    setPointer({
      x,
      y,
    });
  };

  return (
    <section
      className="home-page"
      onMouseMove={handlePointerMove}
      onMouseLeave={() =>
        setPointer({
          x: 0,
          y: 0,
        })
      }
      style={{
        "--pointer-x": `${pointer.x * 18}px`,
        "--pointer-y": `${pointer.y * 18}px`,
      }}
    >

      <div className="home-cosmos-orbit orbit-home-one"></div>

      <div className="home-cosmos-orbit orbit-home-two"></div>

      <div className="home-logo-wrap">

        <img
          src="/ritam-logo.png"
          alt="Ritam"
          className="home-logo"
        />

      </div>

      <div className="home-content">

        <div className="home-copy">

          <div className="eyebrow">
            <span className="eyebrow-signal"></span>
            AI MEDICATION COMPANION · LIVE
          </div>

          <h1>
            Your medicine,
            <br />
            <span>
              explained like a human.
            </span>
          </h1>

          <p className="home-description">
            Ritam transforms complex official drug
            documentation into simple, conversational
            and evidence-grounded information for
            patients and caregivers.
          </p>

          <div className="home-trust">

            <span>01</span>
            Official evidence

            <span className="trust-line"></span>

            <span>02</span>
            Plain language

            <span className="trust-line"></span>

            <span>03</span>
            No guessing

          </div>

          <button
            className="home-launch"
            onClick={() =>
              selectDrug(drug)
            }
          >
            <span>
              Enter your medicine orbit
            </span>

            <span className="launch-arrow">
              ↗
            </span>
          </button>

        </div>

        <div
          className="home-orbit-stage"
          aria-label={`${activeDrug.name} orbit preview`}
        >

          <div className="orbit-stage-grid"></div>

          <div className="stage-arc stage-arc-one"></div>

          <div className="stage-arc stage-arc-two"></div>

          <div className="stage-planet">

            <span>
              {activeDrug.name.charAt(0)}
            </span>

            <i></i>

          </div>

          <div className="stage-satellite satellite-one"></div>

          <div className="stage-satellite satellite-two"></div>

          <div className="stage-caption">

            <span>NOW SCANNING</span>

            <strong>
              {activeDrug.name}
            </strong>

            <small>
              {activeDrug.type}
            </small>

          </div>

        </div>

        <div className="medicine-picker">

          <div className="picker-label">
            SELECT YOUR MEDICINE
          </div>

          <div className="medicine-cards">

            {Object.entries(drugs).map(
              ([id, item]) => (

                <button
                  key={id}
                  className={`medicine-card ${
                    drug === id
                      ? "selected"
                      : ""
                  }`}
                  data-theme={item.theme}
                  onMouseEnter={() =>
                    setHoveredDrug(id)
                  }
                  onMouseLeave={() =>
                    setHoveredDrug(null)
                  }
                  onClick={() =>
                    selectDrug(id)
                  }
                >

                  <div className="medicine-card-orb">
                    {item.name.charAt(0)}
                  </div>

                  <div className="medicine-card-info">

                    <strong>
                      {item.name}
                    </strong>

                    <span>
                      {item.type}
                    </span>

                  </div>

                  <span className="card-arrow">
                    →
                  </span>

                </button>

              )
            )}

          </div>

        </div>

      </div>

      <div className="home-footer">

        <span>RITAM</span>

        <span>
          TRUSTED INFORMATION · HUMAN LANGUAGE
        </span>

      </div>

    </section>
  );
}


/* =========================================================
   MEDICINE HOME
========================================================= */

function MedicineHome({
  currentDrug,
  navigate,
}) {
  return (
    <section className="page medicine-page">

      <PageHeading
        eyebrow="MY MEDICINE"
        title={currentDrug.name}
        description={currentDrug.description}
      />

      <div className="medicine-hero">

        <div className="medicine-hero-orbit">

          <CosmicMedicine
            currentDrug={currentDrug}
          />

        </div>

        <div className="medicine-hero-copy">

          <span className="medicine-type">
            {currentDrug.type}
          </span>

          <h2>
            Understand your medicine
            <br />
            before you take it.
          </h2>

          <p>
            Explore the approved information,
            ask Ritam questions, check things
            you have heard, and follow the
            medicine through its key information.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              navigate("chat")
            }
          >
            Ask Ritam

            <span>→</span>
          </button>

        </div>

      </div>

      <div className="feature-grid">

        <FeatureCard
          number="01"
          title="Ask Ritam"
          description="Have a conversation using simple language."
          icon="◌"
          onClick={() => navigate("chat")}
        />

        <FeatureCard
          number="02"
          title="Medication Journey"
          description="Explore why, how, watch, warnings and food."
          icon="◎"
          onClick={() =>
            navigate("journey")
          }
        />

        <FeatureCard
          number="03"
          title="I Heard..."
          description="Check something you heard against the document."
          icon="⌁"
          onClick={() =>
            navigate("heard")
          }
        />

        <FeatureCard
          number="04"
          title="Evidence"
          description="See where Ritam's information comes from."
          icon="▤"
          onClick={() =>
            navigate("evidence")
          }
        />

      </div>

      <div className="principle-card">

        <div className="principle-mark">
          "
        </div>

        <div>

          <span className="eyebrow">
            RITAM PRINCIPLE
          </span>

          <h3>
            No evidence.
            <br />
            No answer.
          </h3>

          <p>
            Ritam is designed to answer from
            the approved drug document rather
            than filling gaps with guesses.
          </p>

        </div>

      </div>

    </section>
  );
}


/* =========================================================
   COSMIC MEDICINE
========================================================= */

function CosmicMedicine({
  currentDrug,
}) {
  return (
    <div className="cosmic-medicine">

      <div className="cosmic-rings">

        <div className="cosmic-ring ring-one"></div>

        <div className="cosmic-ring ring-two"></div>

        <div className="cosmic-ring ring-three"></div>

      </div>

      <div className="cosmic-particle particle-a"></div>
      <div className="cosmic-particle particle-b"></div>
      <div className="cosmic-particle particle-c"></div>
      <div className="cosmic-particle particle-d"></div>
      <div className="cosmic-particle particle-e"></div>

      <div className="medicine-core">

        <div className="core-glow"></div>

        <span>
          {currentDrug.name.charAt(0)}
        </span>

      </div>

      <div className="cosmic-label">
        {currentDrug.name}
      </div>

    </div>
  );
}


/* =========================================================
   ASK RITAM
========================================================= */

function AskRitam({
  currentDrug,
  drug,
  mode,
  setMode,
}) {
  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const patientExamples = [
    "What is this medicine used for?",
    "What should I know if I have kidney problems?",
    "What if I miss a dose?",
  ];

  const caregiverExamples = [
    "What should a caregiver know about this medicine?",
    "What should I watch for?",
    "What if the person misses a dose?",
  ];

  const examples =
    mode === "caregiver"
      ? caregiverExamples
      : patientExamples;

  const askQuestion = async (
    text = question
  ) => {
    const q = text.trim();

    if (!q || loading) {
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: q,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response =
        await fetch(`${API_URL}/chat`, {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            drug,
            question: q,
            mode:
              mode === "caregiver"
                ? "caregiver"
                : "patient",
          }),
        });

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      setMessages((previous) => [
        ...previous,
        {
          role: "ritam",

          text:
            data.answer ||
            "Ritam returned no answer.",

          sources:
            data.sources || [],
        },
      ]);

    } catch (error) {

      setMessages((previous) => [
        ...previous,
        {
          role: "ritam",

          text:
            "I couldn't reach the Ritam API. Please make sure the FastAPI backend is running.",

          error: true,
        },
      ]);

    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (
    nextMode
  ) => {
    setMode(nextMode);
    setMessages([]);
  };

  return (
    <section className="page chat-page">

      <PageHeading
        eyebrow="ASK RITAM"
        title="Talk to your medicine."
        description={`Ask questions about ${currentDrug.name} in plain language. Ritam answers from the approved drug document.`}
      />

      <div className="chat-layout">

        <div className="chat-main">

          <div className="mode-switch">

            <button
              className={
                mode === "patient"
                  ? "active"
                  : ""
              }
              onClick={() =>
                handleModeChange(
                  "patient"
                )
              }
            >
              <span>◉</span>
              Patient
            </button>

            <button
              className={
                mode === "caregiver"
                  ? "active"
                  : ""
              }
              onClick={() =>
                handleModeChange(
                  "caregiver"
                )
              }
            >
              <span>◌</span>
              Caregiver
            </button>

          </div>

          <div className="chat-window">

            {messages.length === 0 ? (

              <div className="chat-empty">

                <div className="chat-empty-orb">
                  {currentDrug.name.charAt(0)}
                </div>

                <h3>
                  {mode === "caregiver"
                    ? "Help someone understand."
                    : "Ask anything about your medicine."}
                </h3>

                <p>
                  Ritam will search the approved
                  {` ${currentDrug.name}`}
                  document before answering.
                </p>

              </div>

            ) : (

              <div className="message-list">

                {messages.map(
                  (message, index) => (

                    <div
                      key={index}
                      className={`message ${
                        message.role === "user"
                          ? "user-message"
                          : "ritam-message"
                      }`}
                    >

                      <div className="message-label">
                        {message.role ===
                        "user"
                          ? "YOU"
                          : "RITAM"}
                      </div>

                      <div className="message-body">
                        {message.text}
                      </div>

                      {message.sources
                        ?.length > 0 && (

                        <div className="message-sources">

                          {message.sources.map(
                            (
                              source,
                              sourceIndex
                            ) => (

                              <button
                                key={
                                  sourceIndex
                                }
                                className="evidence-link"
                                onClick={() => {

                                  if (
                                    source.pdf_url
                                  ) {

                                    window.open(
                                      `${API_URL}${source.pdf_url}`,
                                      "_blank"
                                    );

                                  }

                                }}
                              >
                                Evidence · Page{" "}
                                {source.page}
                              </button>

                            )
                          )}

                        </div>

                      )}

                    </div>

                  )
                )}

              </div>

            )}

            {loading && (

              <div className="typing-indicator">

                <span></span>
                <span></span>
                <span></span>

                Ritam is checking
                the document...

              </div>

            )}

          </div>

          <div className="chat-input-area">

            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(
                  event.target.value
                )
              }
              onKeyDown={(event) => {

                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {

                  event.preventDefault();

                  askQuestion();
                }

              }}
              placeholder={`Ask about ${currentDrug.name}...`}
              rows={2}
            />

            <button
              className="send-button"
              onClick={() =>
                askQuestion()
              }
              disabled={
                loading ||
                !question.trim()
              }
            >
              →
            </button>

          </div>

          <div className="example-questions">

            <span>
              TRY ASKING
            </span>

            {examples.map(
              (example) => (

                <button
                  key={example}
                  onClick={() =>
                    askQuestion(
                      example
                    )
                  }
                >
                  {example}
                </button>

              )
            )}

          </div>

        </div>

        <div className="chat-side">

          <div className="trust-card">

            <div className="trust-icon">
              ✓
            </div>

            <span className="eyebrow">
              EVIDENCE GROUNDED
            </span>

            <h3>
              The document
              <br />
              comes first.
            </h3>

            <p>
              Ritam does not browse the
              internet for answers. It uses
              the approved {currentDrug.name}
              document supplied to the system.
            </p>

          </div>

          <div className="chat-side-card">

            <span className="eyebrow">
              CURRENT MEDICINE
            </span>

            <strong>
              {currentDrug.name}
            </strong>

            <span>
              {currentDrug.type}
            </span>

          </div>

        </div>

      </div>

    </section>
  );
}


/* =========================================================
   MEDICATION JOURNEY
========================================================= */

function MedicationJourney({
  currentDrug,
  drug,
}) {
  const [journey, setJourney] =
    useState([]);

  const [selected, setSelected] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const loadJourney = async () => {

      setLoading(true);

      try {

        const response =
          await fetch(
            `${API_URL}/journey/${drug}`
          );

        if (!response.ok) {
          throw new Error(
            "Journey request failed"
          );
        }

        const data =
          await response.json();

        setJourney(
          data.journey || []
        );

        if (
          data.journey?.length > 0
        ) {

          setSelected(
            data.journey[0]
          );

        }

      } catch (error) {

        setJourney([]);

      } finally {

        setLoading(false);

      }
    };

    loadJourney();

  }, [drug]);

  return (
    <section className="page journey-page">

      <PageHeading
        eyebrow="MEDICATION JOURNEY"
        title="See the medicine universe."
        description={`Explore the official information around ${currentDrug.name}, from why it is used to what to watch for.`}
      />

      {loading ? (

        <div className="loading-card">
          Loading the approved medication journey...
        </div>

      ) : (

        <>

          <div className="journey-universe">

            <div className="journey-stars">

              {Array.from(
                { length: 20 },
                (_, index) => (

                  <span
                    key={index}
                    style={{
                      left:
                        `${(index * 43) % 100}%`,

                      top:
                        `${(index * 71) % 100}%`,

                      animationDelay:
                        `${index * 0.25}s`,
                    }}
                  />

                )
              )}

            </div>

            <div className="journey-orbit orbit-large"></div>

            <div className="journey-orbit orbit-medium"></div>

            <div className="journey-orbit orbit-small"></div>

            <div className="journey-center">

              <div className="journey-core-glow"></div>

              <span>
                {currentDrug.name.charAt(0)}
              </span>

              <small>
                {currentDrug.name}
              </small>

            </div>

            {journey.map(
              (item, index) => {

                const meta =
                  journeyMeta[item.id] ||
                  {
                    number:
                      String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      ),

                    label:
                      item.id.toUpperCase(),

                    icon: "•",
                  };

                return (

                  <button
                    key={item.id}
                    className={`journey-node node-${index} ${
                      selected?.id ===
                      item.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelected(
                        item
                      )
                    }
                  >

                    <span className="node-number">
                      {meta.number}
                    </span>

                    <span className="node-icon">
                      {meta.icon}
                    </span>

                    <strong>
                      {meta.label}
                    </strong>

                    <small>
                      {item.title}
                    </small>

                  </button>

                );

              }
            )}

          </div>

          {selected && (

            <div className="journey-detail">

              <div className="journey-detail-heading">

                <div>

                  <span className="eyebrow">

                    {selected.id
                      .replace(
                        "_",
                        " "
                      )
                      .toUpperCase()}

                  </span>

                  <h2>
                    {selected.title}
                  </h2>

                </div>

                <div className="source-pill">
                  Page{" "}
                  {selected.sources
                    ?.[0]?.page || "—"}
                </div>

              </div>

              <div className="journey-content">
                {selected.content}
              </div>

              {selected.sources
                ?.length > 0 && (

                <div className="journey-source">

                  <span>
                    OFFICIAL SOURCE
                  </span>

                  <strong>
                    {
                      selected
                        .sources[0]
                        .source
                    }
                  </strong>

                  <span>
                    Page{" "}
                    {
                      selected
                        .sources[0]
                        .page
                    }
                  </span>

                </div>

              )}

            </div>

          )}

        </>

      )}

    </section>
  );
}


/* =========================================================
   I HEARD
========================================================= */

function HeardPage({
  currentDrug,
  drug,
}) {
  const [claim, setClaim] =
    useState("");

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const checkClaim = async (
    text = claim
  ) => {

    const question =
      text.trim();

    if (!question || loading) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {

      const response =
        await fetch(
          `${API_URL}/claim-check`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              drug,
              question,
              mode: "patient",
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      setResult(data);

    } catch (error) {

      setResult({
        status: "UNCLEAR",

        explanation:
          "I couldn't reach the Ritam claim-check service.",

        sources: [],
      });

    } finally {

      setLoading(false);

    }
  };

  const statusClass = result
    ? result.status.toLowerCase()
    : "";

  return (
    <section className="page heard-page">

      <PageHeading
        eyebrow="I HEARD..."
        title="Check what you heard."
        description="Bring a claim, rumor, or piece of advice. Ritam checks it against the approved drug document only."
      />

      <div className="claim-layout">

        <div className="claim-main">

          <div className="claim-label">
            WHAT DID YOU HEAR?
          </div>

          <div className="claim-input-wrap">

            <textarea
              value={claim}
              onChange={(event) =>
                setClaim(
                  event.target.value
                )
              }
              placeholder={`"I heard ${currentDrug.name}..."`}
              rows={5}
            />

            <button
              className="primary-button"
              onClick={() =>
                checkClaim()
              }
              disabled={
                loading ||
                !claim.trim()
              }
            >
              {loading
                ? "Checking..."
                : "Check claim"}

              <span>→</span>

            </button>

          </div>

          <div className="claim-example">

            <span>
              EXAMPLE
            </span>

            <button
              onClick={() =>
                checkClaim(
                  `I heard ${currentDrug.name} can be harmful to the kidneys.`
                )
              }
            >
              I heard{" "}
              {currentDrug.name} can
              be harmful to the
              kidneys.
            </button>

          </div>

        </div>

        <div className="claim-info">

          <div className="claim-info-symbol">
            ?
          </div>

          <h3>
            Ritam does not
            <br />
            decide what is true.
          </h3>

          <p>
            It compares your claim against
            the approved document and tells
            you what the document supports,
            contradicts, or does not mention.
          </p>

          <div className="claim-status-guide">

            <div>
              <span className="guide-dot supported"></span>
              SUPPORTED
            </div>

            <div>
              <span className="guide-dot contradicted"></span>
              CONTRADICTED
            </div>

            <div>
              <span className="guide-dot not-mentioned"></span>
              NOT MENTIONED
            </div>

          </div>

        </div>

      </div>

      {result && (

        <div
          className={`claim-result ${statusClass}`}
        >

          <div className="result-status">

            <div className="result-status-icon">

              {result.status ===
              "SUPPORTED"
                ? "✓"
                : result.status ===
                  "CONTRADICTED"
                ? "!"
                : "?"}

            </div>

            <div>

              <span className="eyebrow">
                DOCUMENT CHECK
              </span>

              <h2>
                {result.status}
              </h2>

            </div>

          </div>

          <div className="result-explanation">
            {result.explanation}
          </div>

          {result.sources
            ?.length > 0 && (

            <div className="result-sources">

              <span>
                SUPPORTED BY
              </span>

              {result.sources.map(
                (
                  source,
                  index
                ) => (

                  <button
                    key={index}
                    className="evidence-link"
                    onClick={() => {

                      if (
                        source.pdf_url
                      ) {

                        window.open(
                          `${API_URL}${source.pdf_url}`,
                          "_blank"
                        );

                      }

                    }}
                  >
                    Official document ·
                    Page{" "}
                    {source.page}
                  </button>

                )
              )}

            </div>

          )}

        </div>

      )}

    </section>
  );
}


/* =========================================================
   EVIDENCE
========================================================= */

function EvidencePage({
  currentDrug,
  drug,
}) {
  const openDrugPdf = () => {

    const pdfName =
      `${currentDrug.name.toUpperCase()}.pdf`;

    const pdfUrl =
      `${API_URL}/drug-files/${drug}/${pdfName}`;

    window.open(
      pdfUrl,
      "_blank"
    );
  };

  return (
    <section className="page evidence-page">

      <PageHeading
        eyebrow="EVIDENCE"
        title="See where Ritam gets its answers."
        description={`Ritam is grounded in the approved ${currentDrug.name} drug document. Every answer can be traced back to evidence.`}
      />

      <div className="evidence-hero">

        <div className="evidence-document">

          <div className="document-top">

            <span>
              OFFICIAL DOCUMENT
            </span>

            <span>
              PDF
            </span>

          </div>

          <div className="document-lines">

            <span></span>
            <span></span>
            <span className="short"></span>
            <span></span>
            <span className="medium"></span>

          </div>

          <div className="document-page-number">
            01
          </div>

        </div>

        <div className="evidence-copy">

          <span className="eyebrow">
            SOURCE OF TRUTH
          </span>

          <h2>
            {currentDrug.name}
            <br />
            approved drug document
          </h2>

          <p>
            The document is processed into
            searchable sections. When you ask
            Ritam a question, relevant evidence
            is retrieved and passed to the answer
            system.
          </p>

          <div className="evidence-flow">

            <span>Your question</span>

            <b>→</b>

            <span>Retrieve</span>

            <b>→</b>

            <span>Verify</span>

            <b>→</b>

            <span>Answer</span>

          </div>

          <button
            className="primary-button"
            onClick={openDrugPdf}
          >
            Open official PDF

            <span>↗</span>
          </button>

        </div>

      </div>

      <div className="evidence-principles">

        <EvidencePrinciple
          number="01"
          title="Approved source"
          text="Answers are grounded in the drug document supplied to Ritam."
        />

        <EvidencePrinciple
          number="02"
          title="Page traceability"
          text="Relevant answers can show the page where the information came from."
        />

        <EvidencePrinciple
          number="03"
          title="No guessing"
          text="When the document does not support an answer, Ritam should not invent one."
        />

      </div>

    </section>
  );
}


/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function PageHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="page-heading">

      <span className="eyebrow">
        {eyebrow}
      </span>

      <h1>{title}</h1>

      <p>{description}</p>

    </div>
  );
}


function FeatureCard({
  number,
  title,
  description,
  icon,
  onClick,
}) {
  return (
    <button
      className="feature-card"
      onClick={onClick}
    >

      <div className="feature-card-top">

        <span>
          {number}
        </span>

        <span className="feature-icon">
          {icon}
        </span>

      </div>

      <h3>
        {title}
      </h3>

      <p>
        {description}
      </p>

      <span className="feature-arrow">
        →
      </span>

    </button>
  );
}


function EvidencePrinciple({
  number,
  title,
  text,
}) {
  return (
    <div className="evidence-principle">

      <span>
        {number}
      </span>

      <div>

        <h3>
          {title}
        </h3>

        <p>
          {text}
        </p>

      </div>

    </div>
  );
}


export default App;