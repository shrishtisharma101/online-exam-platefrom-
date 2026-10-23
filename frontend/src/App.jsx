
import { useCallback, useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  ClipboardList,
  History,
  LogOut,
  Clock3,
  CheckCircle2,
  CircleHelp,
  ArrowRight,
  GraduationCap,
  Menu,
  X,
  Trophy,
  Play,
  LoaderCircle,
  ShieldCheck,
  LockKeyhole,
  Mail,
  UserRound,
  AlertCircle,
} from "lucide-react";
import api, {
  saveSession,
  clearSession,
  getSavedUser,
} from "./api";

function messageFromError(error) {
  return (
    error.response?.data?.message ||
    "Something went wrong. Please check the backend and try again."
  );
}

function Loading({ text = "Loading..." }) {
  return (
    <div className="loading-state">
      <LoaderCircle className="spin" size={26} />
      <p>{text}</p>
    </div>
  );
}

function Notice({ children, type = "error" }) {
  if (!children) return null;

  return (
    <div className={`notice ${type}`}>
      <AlertCircle size={18} />
      <span>{children}</span>
    </div>
  );
}

function ProtectedRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

function AuthPage({ mode, onAuth }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister
        ? { name, email, password }
        : { email, password };

      const response = await api.post(endpoint, payload);
      saveSession(response.data);
      onAuth(response.data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(messageFromError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-decoration">
        <div className="brand brand-light">
          <div className="brand-icon"><GraduationCap size={25} /></div>
          <span>ExamFlow</span>
        </div>

        <div className="auth-hero">
          <span className="eyebrow">YOUR LEARNING JOURNEY</span>
          <h1>Prepare today.<br />Perform your best.</h1>
          <p>
            Practice smarter with mock tests, timed exams and clear results
            that help you track your progress.
          </p>
          <div className="auth-benefit">
            <CheckCircle2 size={19} /> Practice at your own pace
          </div>
          <div className="auth-benefit">
            <CheckCircle2 size={19} /> Get instant test results
          </div>
          <div className="auth-benefit">
            <CheckCircle2 size={19} /> Track your learning journey
          </div>
        </div>

        <div className="auth-footer">Learn consistently. Grow confidently.</div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="mobile-brand brand">
            <div className="brand-icon"><GraduationCap size={23} /></div>
            <span>ExamFlow</span>
          </div>

          <div className="form-heading">
            <span className="eyebrow">
              {isRegister ? "GET STARTED" : "WELCOME BACK"}
            </span>
            <h2>{isRegister ? "Create your account" : "Sign in to ExamFlow"}</h2>
            <p>
              {isRegister
                ? "Join and start preparing for your next exam."
                : "Enter your details to continue learning."}
            </p>
          </div>

          <Notice>{error}</Notice>

          <form onSubmit={handleSubmit} className="auth-form">
            {isRegister && (
              <label className="field">
                <span>Full name</span>
                <div className="input-wrap">
                  <UserRound size={18} />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    minLength={2}
                    maxLength={60}
                    required
                  />
                </div>
              </label>
            )}

            <label className="field">
              <span>Email address</span>
              <div className="input-wrap">
                <Mail size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="field">
              <span>Password</span>
              <div className="input-wrap">
                <LockKeyhole size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  minLength={6}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  required
                />
              </div>
            </label>

            <button className="btn btn-primary btn-full" disabled={loading}>
              {loading ? (
                <><LoaderCircle className="spin" size={18} /> Please wait...</>
              ) : (
                <>{isRegister ? "Create account" : "Sign in"} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="auth-switch">
            {isRegister ? "Already have an account?" : "New to ExamFlow?"}{" "}
            <button
              className="text-button"
              onClick={() => navigate(isRegister ? "/login" : "/register")}
            >
              {isRegister ? "Sign in" : "Create an account"}
            </button>
          </p>

          <div className="secure-note">
            <ShieldCheck size={16} /> Your account is protected
          </div>
        </div>
      </div>
    </div>
  );
}

function AppLayout({ user, onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/exams", label: "Available exams", icon: BookOpen },
    { to: "/history", label: "My results", icon: History },
  ];

  return (
    <div className="app-shell">
      {menuOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon"><GraduationCap size={25} /></div>
          <span>ExamFlow</span>
          <button
            className="icon-button mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-icon"><Trophy size={20} /></div>
            <strong>Keep improving!</strong>
            <p>Every practice test takes you one step forward.</p>
          </div>

          <div className="sidebar-user">
            <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || "S"}</div>
            <div className="user-info">
              <strong>{user?.name || "Student"}</strong>
              <span>{user?.role || "student"}</span>
            </div>
            <button className="icon-button" onClick={onLogout} title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>
          <div className="topbar-label">Student workspace</div>
          <div className="topbar-right">
            <span className="online-dot" />
            <span>Ready to learn</span>
            <div className="avatar avatar-small">
              {user?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>
          </div>
        </header>

        <main className="page-content">{children}</main>

        <footer className="page-footer">
          <span>© {new Date().getFullYear()} ExamFlow</span>
          <span>Learn consistently. Grow confidently.</span>
        </footer>
      </div>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

function Dashboard({ user }) {
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([api.get("/exams"), api.get("/attempts/my")])
      .then(([examResponse, attemptResponse]) => {
        if (!active) return;
        setExams(examResponse.data.exams || []);
        setAttempts(attemptResponse.data.attempts || []);
      })
      .catch((err) => {
        if (active) setError(messageFromError(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const completed = attempts.filter((attempt) => attempt.status === "submitted");
  const average = completed.length
    ? Math.round(
        completed.reduce((sum, attempt) => {
          const percent = attempt.totalMarks
            ? (attempt.score / attempt.totalMarks) * 100
            : 0;
          return sum + percent;
        }, 0) / completed.length
      )
    : 0;

  if (loading) return <Loading text="Loading your dashboard..." />;

  return (
    <>
      <div className="welcome-banner">
        <div>
          <span className="banner-label">YOUR LEARNING SPACE</span>
          <h1>Welcome back, {user?.name?.split(" ")[0] || "Student"}! 👋</h1>
          <p>Ready to challenge yourself? Your next achievement starts here.</p>
        </div>
        <div className="banner-art"><GraduationCap size={76} strokeWidth={1.2} /></div>
      </div>

      <Notice>{error}</Notice>

      <PageHeading
        eyebrow="OVERVIEW"
        title="Your dashboard"
        description="See your practice activity and keep your preparation on track."
      />

      <div className="stats-grid">
        <StatCard icon={BookOpen} label="Available exams" value={exams.length} note="Ready to practice" tone="blue" />
        <StatCard icon={ClipboardList} label="Tests completed" value={completed.length} note="Submitted attempts" tone="purple" />
        <StatCard icon={Trophy} label="Average score" value={`${average}%`} note="Across completed tests" tone="orange" />
      </div>

      <div className="section-heading">
        <div>
          <h2>Explore exams</h2>
          <p>Choose a test and start practicing.</p>
        </div>
        <NavLink to="/exams" className="inline-link">View all <ArrowRight size={16} /></NavLink>
      </div>

      {exams.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No exams available yet"
          text="Published exams will appear here when they are added by an administrator."
        />
      ) : (
        <div className="exam-grid">
          {exams.slice(0, 3).map((exam) => <ExamCard key={exam._id} exam={exam} />)}
        </div>
      )}

      <div className="section-heading history-heading">
        <div>
          <h2>Recent results</h2>
          <p>Your latest submitted attempts.</p>
        </div>
        <NavLink to="/history" className="inline-link">See history <ArrowRight size={16} /></NavLink>
      </div>

      {completed.length === 0 ? (
        <EmptyState
          icon={History}
          title="Your results will show here"
          text="Complete your first test to start tracking your progress."
        />
      ) : (
        <div className="table-card">
          <div className="result-table">
            <div className="result-row result-table-head">
              <span>Exam</span><span>Score</span><span>Percentage</span><span>Status</span>
            </div>
            {completed.slice(0, 4).map((attempt) => (
              <div className="result-row" key={attempt._id}>
                <span className="table-exam">{attempt.exam?.title || "Exam"}</span>
                <span>{attempt.score} / {attempt.totalMarks}</span>
                <span>{attempt.totalMarks ? Math.round(attempt.score / attempt.totalMarks * 100) : 0}%</span>
                <span><span className="status-pill status-success">Submitted</span></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({ icon: Icon, label, value, note, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={21} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </div>
  );
}

function ExamCard({ exam }) {
  return (
    <div className="exam-card">
      <div className="exam-card-top">
        <div className="exam-card-icon"><BookOpen size={22} /></div>
        <span className="status-pill status-ready">Available</span>
      </div>
      <h3>{exam.title}</h3>
      <p className="exam-description">{exam.description || "Practice your skills with this exam."}</p>
      <div className="exam-meta">
        <span><CircleHelp size={16} /> {exam.totalQuestions} questions</span>
        <span><Clock3 size={16} /> {exam.durationMinutes} min</span>
      </div>
      <NavLink to={`/exams/${exam._id}`} className="btn btn-primary btn-full">
        View exam <ArrowRight size={17} />
      </NavLink>
    </div>
  );
}

function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon size={26} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/exams")
      .then((response) => setExams(response.data.exams || []))
      .catch((err) => setError(messageFromError(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeading
        eyebrow="PRACTICE CENTER"
        title="Available exams"
        description="Explore tests, review their duration and start when you're ready."
      />
      <Notice>{error}</Notice>
      {loading ? <Loading text="Finding available exams..." /> :
        exams.length === 0 ? (
          <EmptyState icon={BookOpen} title="No exams available" text="Please check back after an administrator publishes an exam." />
        ) : (
          <div className="exam-grid exam-grid-all">
            {exams.map((exam) => <ExamCard key={exam._id} exam={exam} />)}
          </div>
        )
      }
    </>
  );
}

function ExamDetailsPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    api.get(`/exams/${examId}`)
      .then((response) => setExam(response.data.exam))
      .catch((err) => setError(messageFromError(err)))
      .finally(() => setLoading(false));
  }, [examId]);

  async function startExam() {
    setStarting(true);
    setError("");

    try {
      const response = await api.post("/attempts/start", { examId });
      navigate(`/exam/${response.data.attemptId}`, {
        state: { session: response.data },
      });
    } catch (err) {
      setError(messageFromError(err));
    } finally {
      setStarting(false);
    }
  }

  if (loading) return <Loading text="Loading exam details..." />;

  if (!exam) {
    return (
      <>
        <Notice>{error || "Exam not found."}</Notice>
        <NavLink to="/exams" className="btn btn-secondary">Back to exams</NavLink>
      </>
    );
  }

  const totalMarks = exam.questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  return (
    <div className="detail-layout">
      <div className="detail-main">
        <NavLink to="/exams" className="back-link">← Back to exams</NavLink>
        <div className="detail-hero">
          <div className="detail-icon"><BookOpen size={30} /></div>
          <span className="status-pill status-ready">Available exam</span>
          <h1>{exam.title}</h1>
          <p>{exam.description || "Test your knowledge and see your results immediately after submission."}</p>
        </div>

        <div className="section-heading"><div><h2>Before you begin</h2><p>Review these instructions before starting your attempt.</p></div></div>
        <div className="instructions-list">
          <div><CheckCircle2 size={20} /><span>Read each question carefully before selecting an answer.</span></div>
          <div><Clock3 size={20} /><span>The test has a time limit of {exam.durationMinutes} minutes.</span></div>
          <div><ShieldCheck size={20} /><span>Your score is calculated automatically after submission.</span></div>
          <div><AlertCircle size={20} /><span>Try to complete and submit the test before the timer reaches zero.</span></div>
        </div>
      </div>

      <aside className="detail-sidebar">
        <h3>Exam overview</h3>
        <div className="overview-item"><span><CircleHelp size={18} /> Questions</span><strong>{exam.questions.length}</strong></div>
        <div className="overview-item"><span><Clock3 size={18} /> Duration</span><strong>{exam.durationMinutes} min</strong></div>
        <div className="overview-item"><span><Trophy size={18} /> Total marks</span><strong>{totalMarks}</strong></div>
        <div className="overview-item"><span><ClipboardList size={18} /> Attempts</span><strong>Practice</strong></div>
        <Notice>{error}</Notice>
        <button className="btn btn-primary btn-full" onClick={startExam} disabled={starting}>
          {starting ? <><LoaderCircle className="spin" size={18} /> Starting...</> : <><Play size={18} /> Start exam</>}
        </button>
        <p className="sidebar-disclaimer">The timer begins when the server creates your attempt.</p>
      </aside>
    </div>
  );
}

function TakeExamPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [remaining, setRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const stored = window.history.state?.usr?.session;

        if (stored?.attemptId === attemptId) {
          if (!cancelled) {
            setSession(stored);
            setRemaining(stored.remainingSeconds);
            const initial = {};
            (stored.savedAnswers || []).forEach((answer) => {
              if (answer.selectedOption !== null) {
                initial[answer.questionId] = answer.selectedOption;
              }
            });
            setAnswers(initial);
          }
          return;
        }

        setError("This exam session could not be restored. Please return to Available Exams and open your active test again.");
      } catch (err) {
        setError("Could not load this exam session.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSession().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [attemptId]);

  const submitExam = useCallback(async (auto = false) => {
    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        attemptId,
        answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })),
      };

      const response = await api.post("/attempts/submit", payload);
      navigate(`/result/${attemptId}`, {
        replace: true,
        state: { result: response.data.result, examTitle: session?.exam?.title },
      });
    } catch (err) {
      setError(messageFromError(err));
      setSubmitting(false);
      setConfirmSubmit(false);
    } 
  }, [attemptId, answers, submitting, navigate, session]);

  useEffect(() => {
    if (!session || remaining === null || remaining <= 0) return undefined;

    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [session, remaining === null]);

  useEffect(() => {
    if (session && remaining === 0 && !submitting) {
      submitExam(true);
    }
  }, [session, remaining, submitting, submitExam]);

  if (loading) return <Loading text="Preparing your exam..." />;

  if (!session) {
    return (
      <>
        <Notice>{error || "Exam session unavailable."}</Notice>
        <NavLink to="/exams" className="btn btn-primary">Return to exams</NavLink>
      </>
    );
  }

  const questions = session.exam.questions || [];
  const answeredCount = Object.keys(answers).length;
  const formatTime = (seconds) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="test-layout">
      <div className="test-main">
        <div className="test-top">
          <div>
            <span className="eyebrow">TIMED ASSESSMENT</span>
            <h1>{session.exam.title}</h1>
            <p>{questions.length} questions · Choose one answer per question.</p>
          </div>
          <div className={`timer-box ${remaining < 60 ? "timer-danger" : ""}`}>
            <Clock3 size={20} />
            <div><span>TIME LEFT</span><strong>{formatTime(remaining)}</strong></div>
          </div>
        </div>

        <div className="progress-wrap">
          <div className="progress-label"><span>Progress</span><strong>{answeredCount} of {questions.length} answered</strong></div>
          <div className="progress-track"><div style={{ width: `${questions.length ? answeredCount / questions.length * 100 : 0}%` }} /></div>
        </div>

        <Notice>{error}</Notice>

        {questions.map((question, index) => (
          <section
  className="question-card"
  id={`question-${index}`}
  key={question._id}
>
            <div className="question-number">QUESTION {String(index + 1).padStart(2, "0")} <span>{question.marks} {question.marks === 1 ? "mark" : "marks"}</span></div>
            <h2>{question.questionText}</h2>
            <div className="options-list">
              {question.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className={`option-item ${answers[question._id] === optionIndex ? "option-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name={question._id}
                    checked={answers[question._id] === optionIndex}
                    onChange={() => setAnswers((previous) => ({
                      ...previous,
                      [question._id]: optionIndex,
                    }))}
                  />
                  <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </section>
        ))}

        <div className="submit-bar">
          <span>{questions.length - answeredCount} unanswered</span>
          <button className="btn btn-primary" onClick={() => setConfirmSubmit(true)} disabled={submitting}>
            {submitting ? <><LoaderCircle className="spin" size={18} /> Submitting...</> : <>Submit exam <ArrowRight size={18} /></>}
          </button>
        </div>
      </div>

      <aside className="question-nav">
        <h3>Question navigator</h3>
        <p>Select any question by scrolling to it.</p>
        <div className="question-number-grid">
          {questions.map((question, index) => (
            <button
              key={question._id}
              className={answers[question._id] !== undefined ? "number-answered" : ""}
              onClick={() => document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="navigator-legend"><span className="legend-dot answered" /> Answered <span className="legend-dot" /> Not answered</div>
        <div className="navigator-tip"><Clock3 size={18} /> Your timer is controlled by the server's start time.</div>
      </aside>

      {confirmSubmit && (
        <div className="modal-backdrop">
          <div className="confirm-modal">
            <div className="modal-icon"><ClipboardList size={25} /></div>
            <h2>Submit your exam?</h2>
            <p>
              You have answered {answeredCount} out of {questions.length} questions.
              {questions.length - answeredCount > 0
                ? ` ${questions.length - answeredCount} question(s) will be marked unanswered.`
                : ""}
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmSubmit(false)}>Continue test</button>
              <button className="btn btn-primary" onClick={() => submitExam(false)} disabled={submitting}>Confirm submission</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [title, setTitle] = useState("Your exam");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = window.history.state?.usr;
    if (stored?.result) {
      setResult(stored.result);
      setTitle(stored.examTitle || "Your exam");
    } else {
      setError("Result details are not available on this page. Please check My Results for saved attempts.");
    }
  }, [attemptId]);

  if (!result) {
    return (
      <>
        <Notice>{error}</Notice>
        <NavLink to="/history" className="btn btn-primary">View my results</NavLink>
      </>
    );
  }

  const percentage = result.percentage ??
    (result.totalMarks ? Math.round(result.score / result.totalMarks * 100) : 0);

  return (
    <div className="result-page">
      <div className="result-hero">
        <div className="result-trophy"><Trophy size={34} /></div>
        <span className="eyebrow">ASSESSMENT COMPLETE</span>
        <h1>Well done!</h1>
        <p>You have submitted <strong>{title}</strong>. Here is your result.</p>
        <div className="score-circle" style={{ "--score": `${percentage}%` }}>
          <div><strong>{percentage}%</strong><span>Overall score</span></div>
        </div>
        <div className="score-summary">
          <div><span>Marks obtained</span><strong>{result.score}</strong></div>
          <div><span>Total marks</span><strong>{result.totalMarks}</strong></div>
          <div><span>Status</span><strong>Submitted</strong></div>
        </div>
      </div>
      <div className="result-actions">
        <button className="btn btn-primary" onClick={() => navigate("/exams")}>Practice another exam <ArrowRight size={18} /></button>
        <button className="btn btn-secondary" onClick={() => navigate("/history")}>View result history</button>
      </div>
    </div>
  );
}

function HistoryPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/attempts/my")
      .then((response) => setAttempts(response.data.attempts || []))
      .catch((err) => setError(messageFromError(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeading
        eyebrow="YOUR PROGRESS"
        title="My results"
        description="Review your previous test attempts and scores."
      />
      <Notice>{error}</Notice>
      {loading ? <Loading text="Loading your results..." /> :
        attempts.length === 0 ? (
          <EmptyState icon={History} title="No results yet" text="Your completed exams and scores will appear here." />
        ) : (
          <div className="table-card">
            <div className="result-table">
              <div className="result-row history-table-head">
                <span>Exam</span><span>Score</span><span>Percentage</span><span>Status</span><span>Date</span>
              </div>
              {attempts.map((attempt) => {
                const percentage = attempt.totalMarks
                  ? Math.round(attempt.score / attempt.totalMarks * 100)
                  : 0;
                return (
                  <div className="result-row history-row" key={attempt._id}>
                    <span className="table-exam">{attempt.exam?.title || "Exam"}</span>
                    <span>{attempt.score} / {attempt.totalMarks}</span>
                    <span>{attempt.status === "submitted" ? `${percentage}%` : "—"}</span>
                    <span><span className={`status-pill ${attempt.status === "submitted" ? "status-success" : "status-ready"}`}>{attempt.status}</span></span>
                    <span>{new Date(attempt.submittedAt || attempt.startedAt).toLocaleDateString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )
      }
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(getSavedUser);

  const handleLogout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to="/" replace /> : <AuthPage mode="login" onAuth={setUser} />
      } />
      <Route path="/register" element={
        user ? <Navigate to="/" replace /> : <AuthPage mode="register" onAuth={setUser} />
      } />

      <Route path="/" element={
        <ProtectedRoute user={user}>
          <AppLayout user={user} onLogout={handleLogout}><Dashboard user={user} /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/exams" element={
        <ProtectedRoute user={user}>
          <AppLayout user={user} onLogout={handleLogout}><ExamsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/exams/:examId" element={
        <ProtectedRoute user={user}>
          <AppLayout user={user} onLogout={handleLogout}><ExamDetailsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/exam/:attemptId" element={
        <ProtectedRoute user={user}>
          <AppLayout user={user} onLogout={handleLogout}><TakeExamPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/result/:attemptId" element={
        <ProtectedRoute user={user}>
          <AppLayout user={user} onLogout={handleLogout}><ResultPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/history" element={
        <ProtectedRoute user={user}>
          <AppLayout user={user} onLogout={handleLogout}><HistoryPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
}
