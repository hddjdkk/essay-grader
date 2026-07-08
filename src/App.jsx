import React, { useState, useEffect, useRef } from "react";

const storage = {
  async get(key) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? null : { key, value: v };
    } catch (e) {
      return null;
    }
  },
  async set(key, value) {
    try {
      localStorage.setItem(key, value);
      return { key, value };
    } catch (e) {
      return null;
    }
  },
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [view, setView] = useState("upload");
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [pendingImageType, setPendingImageType] = useState("image/jpeg");
  const [studentName, setStudentName] = useState("");
  const [maxScore, setMaxScore] = useState(60);
  const [gradeLevel, setGradeLevel] = useState("初中");
  const [error, setError] = useState("");
  const [grading, setGrading] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await storage.get("students");
        if (s) setStudents(JSON.parse(s.value));
      } catch (e) {}
      try {
        const r = await storage.get("records");
        if (r) setRecords(JSON.parse(r.value));
      } catch (e) {}
      try {
        const k = await storage.get("apiKey");
        if (k) setApiKey(k.value);
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  async function saveStudents(next) {
    setStudents(next);
    try {
      await storage.set("students", JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
  }

  async function saveRecords(next) {
    setRecords(next);
    try {
      await storage.set("records", JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
  }

  async function saveApiKey(key) {
    setApiKey(key);
    try {
      await storage.set("apiKey", key);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    try {
      const base64 = await fileToBase64(file);
      setPendingImage(base64);
      setPendingImageType(file.type || "image/jpeg");
      setView("grading");
    } catch (err) {
      setError("图片读取失败，请重试。");
    }
  }

  async function runGrading() {
    if (!pendingImage) return;
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }
    setError("");
    setGrading(true);
    try {
      const systemPrompt = `你是一位经验丰富的中国语文老师，负责批改学生的语文作文。你会收到一张作文手写照片。请完成以下工作：
1. 尽力识别照片中的文字内容（OCR），忽略无法辨认的部分，不要编造内容。
2. 按照中国语文考试作文评分标准（内容立意、结构层次、语言表达、书写卷面）给出一个分数，满分为 ${maxScore} 分，年级水平为「${gradeLevel}」，评分要合理、不过分严苛也不过分宽松。
3. 给出一段总体评语（150-250字），指出文章的优点和不足。
4. 给出3-5条具体、可操作的修改建议（每条不超过40字），建议要具体到段落或句子层面，而不是空泛的套话。
5. 如果照片无法识别为作文内容（比如空白、模糊到无法辨认、不是作文），在 ocrText 中说明情况，score 设为 null。

请仅返回如下 JSON 格式，不要有任何多余文字、不要用 markdown 代码块包裹：
{
  "ocrText": "识别出的作文原文（尽量完整，识别不出的地方用【无法识别】标注）",
  "score": 数字或null,
  "maxScore": ${maxScore},
  "comment": "总体评语",
  "suggestions": ["建议1", "建议2", "建议3"],
  "highlights": {
    "strengths": ["优点1", "优点2"],
    "weaknesses": ["不足1", "不足2"]
  }
}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: pendingImageType,
                    data: pendingImage,
                  },
                },
                { type: "text", text: "请批改这份作文。" },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || "API   return (
    <div style={styles.page}>
      <GlobalStyle />
      <Header
        view={view}
        setView={setView}
        onOpenSettings={() => setShowApiKeyModal(true)}
      />

      {showApiKeyModal && (
        <ApiKeyModal
          currentKey={apiKey}
          onSave={(key) => {
            saveApiKey(key.trim());
            setShowApiKeyModal(false);
          }}
          onClose={() => setShowApiKeyModal(false)}
        />
      )}

      {error && (
        <div style={styles.errorBanner}>
          <span>{error}</span>
          <button style={styles.errorClose} onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {view === "upload" && (
        <UploadView
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
          maxScore={maxScore}
          setMaxScore={setMaxScore}
          gradeLevel={gradeLevel}
          setGradeLevel={setGradeLevel}
          studentCount={students.length}
          recordCount={records.length}
          setView={setView}
        />
      )}

      {view === "grading" && (
        <GradingView
          image={pendingImage}
          imageType={pendingImageType}
          grading={grading}
          onGrade={runGrading}
          onCancel={discardResult}
        />
      )}

      {view === "result" && currentResult && (
        <ResultView
          result={currentResult}
          image={pendingImage}
          imageType={pendingImageType}
          studentName={studentName}
          setStudentName={setStudentName}
          onSave={saveRecord}
          onDiscard={discardResult}
        />
      )}

      {view === "history" && (
        <HistoryView
          students={students}
          records={records}
          onOpenStudent={(s) => {
            setSelectedStudent(s);
            setView("studentDetail");
          }}
          onDeleteRecord={deleteRecord}
        />
      )}

      {view === "studentDetail" && selectedStudent && (
        <StudentDetailView
          student={selectedStudent}
          records={records.filter((r) => r.studentId === selectedStudent.id)}
          onBack={() => setView("history")}
          onDeleteRecord={deleteRecord}
        />
      )}
    </div>
  );
}

function Header({ view, setView, onOpenSettings }) {
  return (
    <header style={styles.header}>
      <div style={styles.headerInner}>
        <div style={styles.brand} onClick={() => setView("upload")}>
          <span style={styles.brandSeal}>阅</span>
          <div>
            <div style={styles.brandTitle}>朱批</div>
            <div style={styles.brandSub}>语文作文智能阅卷</div>
          </div>
        </div>
        <nav style={styles.nav}>
          <button
            style={{
              ...styles.navBtn,
              ...(view === "upload" ? styles.navBtnActive : {}),
            }}
            onClick={() => setView("upload")}
          >
            批改
          </button>
          <button
            style={{
              ...styles.navBtn,
              ...(view === "history" || view === "studentDetail"
                ? styles.navBtnActive
                : {}),
            }}
            onClick={() => setView("history")}
          >
            记录
          </button>
          <button style={styles.navBtn} onClick={onOpenSettings}>
            ⚙
          </button>
        </nav>
      </div>
    </header>
  );
}

function ApiKeyModal({ currentKey, onSave, onClose }) {
  const [value, setValue] = useState(currentKey || "");

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={styles.gradingPanelTitle}>设置 API Key</div>
        <p style={styles.gradingPanelDesc}>
          批改功能需要 Anthropic API Key。Key 只保存在你自己的浏览器本地，不会上传到任何服务器。
          <br />
          还没有的话，去{" "}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#B23A2F" }}
          >
            console.anthropic.com
          </a>{" "}
          免费申请。
        </p>
        <input
          style={styles.textInput}
          placeholder="sk-ant-..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="password"
        />
        <div style={styles.btnRow}>
          <button style={styles.secondaryBtn} onClick={onClose}>
            取消
          </button>
          <button
            style={styles.primaryBtn}
            onClick={() => value.trim() && onSave(value)}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadView({
  fileInputRef,
  handleFileSelect,
  maxScore,
  setMaxScore,
  gradeLevel,
  setGradeLevel,
  studentCount,
  recordCount,
  setView,
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <div style={styles.heroEyebrow}>拍照 · 上传 · 即刻批改</div>
        <h1 style={styles.heroTitle}>
          把作文拍下来，
          <br />
          剩下的交给朱批。
        </h1>
        <p style={styles.heroDesc}>
          自动识别手写作文、按标准给出分数与评语、提出具体修改建议，
          所有批改记录长期保存，随时可查每位学生的进步轨迹。
        </p>
        <div style={styles.heroStats}>
          <div style={styles.heroStat}>
            <div style={styles.heroStatNum}>{studentCount}</div>
            <div style={styles.heroStatLabel}>位学生</div>
          </div>
          <div style={styles.heroStatDivider} />
          <div style={styles.heroStat}>
            <div style={styles.heroStatNum}>{recordCount}</div>
            <div style={styles.heroStatLabel}>份批改记录</div>
          </div>
        </div>
      </section>

      <section
        style={{
          ...styles.dropzone,
          ...(dragOver ? styles.dropzoneActive : {}),
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files[0]) {
            const fakeEvent = { target: { files: e.dataTransfer.files } };
            handleFileSelect(fakeEvent);
          }
        }}
      >
        <div style={styles.dropzoneSeal}>朱</div>
        <p style={styles.dropzoneText}>点击或拖拽上传作文照片</p>
        <p style={styles.dropzoneHint}>支持 JPG / PNG，建议光线充足、字迹清晰</p>
        <button
          style={styles.uploadBtn}
          onClick={() => fileInputRef.current.click()}
        >
          选择图片
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </section>

      <section style={styles.settingsCard}>
        <div style={styles.settingsTitle}>批改设置</div>
        <div style={styles.settingsRow}>
          <label style={styles.settingsLabel}>年级水平</label>
          <select
            style={styles.select}
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
          >
            <option value="小学">小学</option>
            <option value="初中">初中</option>
            <option value="高中">高中</option>
          </select>
        </div>
        <div style={styles.settingsRow}>
          <label style={styles.settingsLabel}>作文满分</label>
          <select
            style={styles.select}
            value={maxScore}
            onChange={(e) => setMaxScore(Number(e.target.value))}
          >
            <option value={30}>30 分</option>
            <option value={40}>40 分</option>
            <option value={50}>50 分</option>
            <option value={60}>60 分</option>
            <option value={100}>100 分</option>
          </select>
        </div>
      </section>
    </main>
  );
}

function GradingView({ image, imageType, grading, onGrade, onCancel }) {
  return (
    <main style={styles.main}>
      <div style={styles.gradingLayout}>
        <div style={styles.previewCard}>
          <img
            src={`data:${imageType};base64,${image}`}
            alt="作文照片"
            style={styles.previewImg}
          />
        </div>
        <div style={styles.gradingPanel}>
          {!grading ? (
            <>
              <div style={styles.gradingPanelTitle}>确认图片，开始批改</div>
              <p style={styles.gradingPanelDesc}>
                请确认照片清晰、完整。批改过程约需10-20秒，请耐心等待。
              </p>
              <div style={styles.btnRow}>
                <button style={styles.secondaryBtn} onClick={onCancel}>
                  重新选择
                </button>
                <button style={styles.primaryBtn} onClick={onGrade}>
                  开始批改
                </button>
              </div>
            </>
          ) : (
            <div style={styles.gradingLoading}>
              <div style={styles.brushLoader}>
                <div style={styles.brushDot} />
                <div style={styles.brushDot} />
                <div style={styles.brushDot} />
              </div>
              <div style={styles.gradingPanelTitle}>正在批阅中…</div>
              <p style={styles.gradingPanelDesc}>
                正在识别文字并对照评分标准分析，请稍候
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function ResultView({
  result,
  image,
  imageType,
  studentName,
  setStudentName,
  onSave,
  onDiscard,
}) {
  const scoreInvalid = result.score === null || result.score === undefined;

  return (
    <main style={styles.main}>
      <div style={styles.resultLayout}>
        <div style={styles.previewCard}>
          <img
            src={`data:${imageType};base64,${image}`}
            alt="作文照片"
            style={styles.previewImg}
          />
        </div>

        <div style={styles.resultContent}>
          {scoreInvalid ? (
            <div style={styles.warnBox}>
              <div style={styles.warnTitle}>无法识别</div>
              <p style={styles.warnText}>{result.ocrText}</p>
            </div>
          ) : (
            <>
              <div style={styles.scoreCard}>
                <div style={styles.scoreSealWrap}>
                  <div style={styles.scoreSeal}>
                    <div style={styles.scoreNum}>{result.score}</div>
                    <div style={styles.scoreMax}>/ {result.maxScore}</div>
                  </div>
                </div>
                <div style={styles.commentBlock}>
                  <div style={styles.commentLabel}>总评</div>
                  <p style={styles.commentText}>{result.comment}</p>
                </div>
              </div>

              {result.highlights && (
                <div style={styles.highlightsRow}>
                  <div style={styles.highlightCol}>
                    <div style={{ ...styles.highlightLabel, color: "#5C7A5C" }}>
                      优点
                    </div>
                    <ul style={styles.highlightList}>
                      {(result.highlights.strengths || []).map((s, i) => (
                        <li key={i} style={styles.highlightItem}>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={styles.highlightCol}>
                    <div style={{ ...styles.highlightLabel, color: "#B23A2F" }}>
                      不足
                    </div>
                    <ul style={styles.highlightList}>
                      {(result.highlights.weaknesses || []).map((s, i) => (
                        <li key={i} style={styles.highlightItem}>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div style={styles.suggestionsBlock}>
                <div style={styles.commentLabel}>修改建议</div>
                <ol style={styles.suggestionsList}>
                  {(result.suggestions || []).map((s, i) => (
                    <li key={i} style={styles.suggestionItem}>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>

              <details style={styles.ocrDetails}>
                <summary style={styles.ocrSummary}>查看识别原文</summary>
                <p style={styles.ocrText}>{result.ocrText}</p>
              </details>
            </>
          )}

          <div style={styles.saveBlock}>
            <label style={styles.settingsLabel}>学生姓名</label>
            <input
              style={styles.textInput}
              placeholder="输入学生姓名以保存记录"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
            <div style={styles.btnRow}>
              <button style={styles.secondaryBtn} onClick={onDiscard}>
                不保存，返回
              </button>
              <button style={styles.primaryBtn} onClick={onSave}>
                保存记录
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
}

function HistoryView({ students, records, onOpenStudent, onDeleteRecord }) {
  if (students.length === 0) {
    return (
      <main style={styles.main}>
        <EmptyState
          title="还没有批改记录"
          desc="上传第一份作文，开始建立学生档案"
        />
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <h2 style={styles.sectionTitle}>学生档案</h2>
      <div style={styles.studentGrid}>
        {students.map((s) => {
          const studentRecords = records.filter((r) => r.studentId === s.id);
          const scored = studentRecords.filter(
            (r) => r.score !== null && r.score !== undefined
          );
          const avg =
            scored.length > 0
              ? (
                  scored.reduce((sum, r) => sum + r.score / r.maxScore, 0) /
                  scored.length *
                  100
                ).toFixed(0)
              : null;
          return (
            <div
              key={s.id}
              style={styles.studentCard}
              onClick={() => onOpenStudent(s)}
            >
              <div style={styles.studentAvatar}>{s.name.charAt(0)}</div>
              <div style={styles.studentInfo}>
                <div style={styles.studentName}>{s.name}</div>
                <div style={styles.studentMeta}>
                  {studentRecords.length} 篇作文
                  {avg !== null && <span> · 平均得分率 {avg}%</span>}
                </div>
              </div>
              <div style={styles.studentArrow}>→</div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function StudentDetailView({ student, records, onBack, onDeleteRecord }) {
  const sorted = [...records].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <main style={styles.main}>
      <button style={styles.backBtn} onClick={onBack}>
        ← 返回记录
      </button>
      <div style={styles.studentDetailHeader}>
        <div style={styles.studentAvatarLg}>{student.name.charAt(0)}</div>
        <div>
          <h2 style={styles.studentDetailName}>{student.name}</h2>
          <div style={styles.studentMeta}>{records.length} 篇作文记录</div>
        </div>
      </div>

      <div style={styles.timelineList}>
        {sorted.map((r) => (
          <div key={r.id} style={styles.timelineCard}>
            <div style={styles.timelineImgWrap}>
              <img
                src={`data:${r.imageType};base64,${r.imageBase64}`}
                alt="作文"
                style={styles.timelineImg}
              />
            </div>
            <div style={styles.timelineContent}>
              <div style={styles.timelineTop}>
                <span style={styles.timelineDate}>
                  {new Date(r.date).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                {r.score !== null && r.score !== undefined ? (
                  <span style={styles.timelineScore}>
                    {r.score} / {r.maxScore}
                  </span>
                ) : (
                  <span style={styles.timelineScoreInvalid}>未识别</span>
                )}
              </div>
              <p style={styles.timelineComment}>{r.comment || r.ocrText}</p>
              <button
                style={styles.deleteBtn}
                onClick={() => onDeleteRecord(r.id)}
              >
                删除记录
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function EmptyState({ title, desc }) {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptySeal}>空</div>
      <div style={styles.emptyTitle}>{title}</div>
      <p style={styles.emptyDesc}>{desc}</p>
    </div>
  );
}

function GlobalStyle() {
  return (
    <style>{`
      @keyframes brushBounce {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
      }
      * { box-sizing: border-box; }
      body { margin: 0; }
      ::selection { background: #B23A2F; color: #F7F4EC; }
      input:focus, select:focus, textarea:focus {
        outline: 2px solid #B23A2F;
        outline-offset: 1px;
      }
      button:focus-visible {
        outline: 2px solid #B23A2F;
        outline-offset: 2px;
      }
    `}</style>
  );
}

const serif = `"Noto Serif SC", "Songti SC", "SimSun", serif`;
const sans = `"PingFang SC", "Microsoft YaHei", -apple-system, sans-serif`;

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F7F4EC",
    fontFamily: sans,
    color: "#2B2B28",
  },
  loadingWrap: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingSeal: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    border: "3px solid #B23A2F",
    color: "#B23A2F",
    fontFamily: serif,
    fontSize: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { color: "#8A8578", fontSize: 14 },

  header: {
    borderBottom: "1px solid #E4DFD0",
    position: "sticky",
    top: 0,
    background: "#F7F4ECee",
    backdropFilter: "blur(6px)",
    zIndex: 10,
  },
  headerInner: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "14px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  brandSeal: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "#B23A2F",
    color: "#F7F4EC",
    fontFamily: serif,
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandTitle: { fontFamily: serif, fontSize: 17, fontWeight: 700, lineHeight: 1.2 },
  brandSub: { fontSize: 11, color: "#8A8578", marginTop: 1 },
  nav: { display: "flex", gap: 4 },
  navBtn: {
    border: "none",
    background: "transparent",
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 13,
    color: "#8A8578",
    cursor: "pointer",
    fontFamily: sans,
  },
  navBtnActive: { background: "#2B2B28", color: "#F7F4EC" },

  main: { maxWidth: 720, margin: "0 auto", padding: "28px 20px 60px" },

  errorBanner: {
    maxWidth: 720,
    margin: "12px auto 0",
    padding: "10px 16px",
    background: "#B23A2F14",
    border: "1px solid #B23A2F44",
    borderRadius: 8,
    color: "#B23A2F",
    fontSize: 13,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorClose: {
    border: "none",
    background: "none",
    color: "#B23A2F",
    fontSize: 18,
    cursor: "pointer",
    lineHeight: 1,
  },

  hero: { padding: "20px 0 32px", borderBottom: "1px solid #E4DFD0" },
  heroEyebrow: {
    fontSize: 12,
    letterSpacing: "0.15em",
    color: "#B23A2F",
    marginBottom: 12,
    fontWeight: 600,
  },
  heroTitle: {
    fontFamily: serif,
    fontSize: 34,
    lineHeight: 1.35,
    margin: "0 0 14px",
    fontWeight: 700,
  },
  heroDesc: {
    fontSize: 14.5,
    lineHeight: 1.8,
    color: "#5c584f",
    maxWidth: 480,
    margin: "0 0 20px",
  },
  heroStats: { display: "flex", alignItems: "center", gap: 20 },
  heroStat: { textAlign: "left" },
  heroStatNum: { fontFamily: serif, fontSize: 26, fontWeight: 700, color: "#2B2B28" },
  heroStatLabel: { fontSize: 12, color: "#8A8578" },
  heroStatDivider: { width: 1, height: 30, background: "#E4DFD0" },

  dropzone: {
    marginTop: 28,
    border: "2px dashed #D8D2BE",
    borderRadius: 16,
    padding: "40px 24px",
    textAlign: "center",
    background: "#FCFAF3",
    transition: "border-color 0.2s, background 0.2s",
  },
  dropzoneActive: { borderColor: "#B23A2F", background: "#B23A2F0a" },
  dropzoneSeal: {
    width: 48,
    height: 48,
    margin: "0 auto 14px",
    borderRadius: "50%",
    border: "2px solid #B23A2F",
    color: "#B23A2F",
    fontFamily: serif,
    fontSize: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dropzoneText: { fontSize: 15, fontWeight: 600, margin: "0 0 6px" },
  dropzoneHint: { fontSize: 12.5, color: "#8A8578", margin: "0 0 20px" },
  uploadBtn: {
    background: "#2B2B28",
    color: "#F7F4EC",
    border: "none",
    borderRadius: 24,
    padding: "10px 28px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },

  settingsCard: {
    marginTop: 24,
    background: "#FCFAF3",
    border: "1px solid #E4DFD0",
    borderRadius: 12,
    padding: 18,
  },
  settingsTitle: { fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#5c584f" },
  settingsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
  },
  settingsLabel: { fontSize: 13.5, color: "#2B2B28", fontWeight: 500 },
  select: {
    border: "1px solid #D8D2BE",
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 13.5,
    background: "#fff",
    color: "#2B2B28",
    fontFamily: sans,
  },

  gradingLayout: { display: "flex", flexDirection: "column", gap: 20 },
  previewCard: {
    borderRadius: 14,
    overflow: "hidden",
    border: "1px solid #E4DFD0",
    background: "#fff",
    maxHeight: 420,
    display: "flex",
    justifyContent: "center",
  },
  previewImg: { width: "100%", maxHeight: 420, objectFit: "contain" },
  gradingPanel: {
    background: "#FCFAF3",
    border: "1px solid #E4DFD0",
    borderRadius: 14,
    padding: 22,
    textAlign: "center",
  },
  gradingPanelTitle: { fontFamily: serif, fontSize: 18, fontWeight: 700, marginBottom: 8 },
  gradingPanelDesc: { fontSize: 13, color: "#8A8578", lineHeight: 1.6, marginBottom: 18 },
  gradingLoading: { padding: "10px 0" },
  brushLoader: { display: "flex", justifyContent: "center", gap: 8, marginBottom: 18 },
  brushDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#B23A2F",
    animation: "brushBounce 1.2s infinite ease-in-out",
  },

  btnRow: { display: "flex", gap: 10, justifyContent: "center", marginTop: 6 },
  primaryBtn: {
    background: "#B23A2F",
    color: "#F7F4EC",
    border: "none",
    borderRadius: 24,
    padding: "10px 26px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "transparent",
    color: "#5c584f",
    border: "1px solid #D8D2BE",
    borderRadius: 24,
    padding: "10px 26px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },

  resultLayout: { display: "flex", flexDirection: "column", gap: 20 },
  resultContent: { display: "flex", flexDirection: "column", gap: 20 },

  warnBox: {
    background: "#B23A2F0f",
    border: "1px solid #B23A2F33",
    borderRadius: 12,
    padding: 18,
  },
  warnTitle: { fontWeight: 700, color: "#B23A2F", marginBottom: 8 },
  warnText: { fontSize: 13.5, lineHeight: 1.7, color: "#5c584f" },

  scoreCard: {
    display: "flex",
    gap: 18,
    alignItems: "flex-start",
    background: "#FCFAF3",
    border: "1px solid #E4DFD0",
    borderRadius: 14,
    padding: 20,
  },
  scoreSealWrap: { flexShrink: 0 },
  scoreSeal: {
    width: 84,
    height: 84,
    borderRadius: "50%",
    border: "3px solid #B23A2F",
    color: "#B23A2F",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    transform: "rotate(-4deg)",
  },
  scoreNum: { fontFamily: serif, fontSize: 26, fontWeight: 700, lineHeight: 1 },
  scoreMax: { fontSize: 11, marginTop: 2 },
  commentBlock: { flex: 1 },
  commentLabel: { fontSize: 12, fontWeight: 700, color: "#8A8578", marginBottom: 6, letterSpacing: "0.05em" },
  commentText: { fontSize: 14, lineHeight: 1.8, color: "#2B2B28", margin: 0 },

  highlightsRow: { display: "flex", gap: 16 },
  highlightCol: {
    flex: 1,
    background: "#FCFAF3",
    border: "1px solid #E4DFD0",
    borderRadius: 12,
    padding: 14,
  },
  highlightLabel: { fontSize: 12.5, fontWeight: 700, marginBottom: 8 },
  highlightList: { margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.9, color: "#2B2B28" },
  highlightItem: { marginBottom: 2 },

  suggestionsBlock: {
    background: "#FCFAF3",
    border: "1px solid #E4DFD0",
    borderLeft: "3px solid #B23A2F",
    borderRadius: 12,
    padding: 16,
  },
  suggestionsList: { margin: "8px 0 0", paddingLeft: 20, fontSize: 13.5, lineHeight: 2, color: "#2B2B28" },
  suggestionItem: {},

  ocrDetails: {
    background: "#FCFAF3",
    border: "1px solid #E4DFD0",
    borderRadius: 12,
    padding: 14,
  },
  ocrSummary: { fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#5c584f" },
  ocrText: { fontSize: 13, lineHeight: 1.9, color: "#5c584f", marginTop: 10, whiteSpace: "pre-wrap" },

  saveBlock: {
    borderTop: "1px solid #E4DFD0",
    paddingTop: 18,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  textInput: {
    border: "1px solid #D8D2BE",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    fontFamily: sans,
    background: "#fff",
  },

  sectionTitle: { fontFamily: serif, fontSize: 22, fontWeight: 700, margin: "0 0 18px" },

  studentGrid: { display: "flex", flexDirection: "column", gap: 10 },
  studentCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "#FCFAF3",
    border: "1px solid #E4DFD0",
    borderRadius: 12,
    padding: "14px 16px",
    cursor: "pointer",
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#2B2B28",
    color: "#F7F4EC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: serif,
    fontSize: 16,
    flexShrink: 0,
  },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: 600 },
  studentMeta: { fontSize: 12.5, color: "#8A8578", marginTop: 2 },
  studentArrow: { color: "#B23A2F", fontSize: 16 },

  backBtn: {
    border: "none",
    background: "none",
    color: "#8A8578",
    fontSize: 13,
    cursor: "pointer",
    marginBottom: 16,
    padding: 0,
  },
  studentDetailHeader: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24 },
  studentAvatarLg: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#2B2B28",
    color: "#F7F4EC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: serif,
    fontSize: 22,
    flexShrink: 0,
  },
  studentDetailName: { fontFamily: serif, fontSize: 22, margin: 0 },

  timelineList: { display: "flex", flexDirection: "column", gap: 14 },
  timelineCard: {
    display: "flex",
    gap: 14,
    background: "#FCFAF3",
    border: "1px solid #E4DFD0",
    borderRadius: 12,
    padding: 14,
  },
  timelineImgWrap: {
    width: 80,
    height: 100,
    flexShrink: 0,
    borderRadius: 8,
    overflow: "hidden",
    background: "#fff",
    border: "1px solid #E4DFD0",
  },
  timelineImg: { width: "100%", height: "100%", objectFit: "cover" },
  timelineContent: { flex: 1, minWidth: 0 },
  timelineTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  timelineDate: { fontSize: 12, color: "#8A8578" },
  timelineScore: { fontFamily: serif, fontSize: 15, fontWeight: 700, color: "#B23A2F" },
  timelineScoreInvalid: { fontSize: 12, color: "#8A8578" },
  timelineComment: {
    fontSize: 13,
    lineHeight: 1.7,
    color: "#2B2B28",
    margin: "0 0 8px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  deleteBtn: {
    border: "none",
    background: "none",
    color: "#B23A2F",
    fontSize: 12,
    cursor: "pointer",
    padding: 0,
  },

  emptyState: { textAlign: "center", padding: "60px 20px" },
  emptySeal: {
    width: 48,
    height: 48,
    margin: "0 auto 16px",
    borderRadius: "50%",
    border: "2px solid #D8D2BE",
    color: "#8A8578",
    fontFamily: serif,
    fontSize: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontFamily: serif, fontSize: 18, fontWeight: 700, marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: "#8A8578" },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "#2B2B2899",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 100,
  },
  modalCard: {
    background: "#F7F4EC",
    borderRadius: 16,
    padding: 24,
    maxWidth: 420,
    width: "100%",
  },
};

