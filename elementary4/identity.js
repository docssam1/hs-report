(() => {
  const NAME_EDIT_PERMISSION = "hselementary:student-name:edit";

  const trimName = value => String(value ?? "").trim().slice(0, 20);

  function readStorage(storage, key) {
    try {
      return storage?.getItem(key) || "";
    } catch (error) {
      return "";
    }
  }

  function readJsonStorage(storage, key) {
    const value = readStorage(storage, key);
    if (!value) return null;
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function sessionName(session) {
    return trimName(session?.name || session?.studentName || session?.displayName || session?.user?.name);
  }

  function permissionSet(session) {
    const values = session?.permissions ?? session?.permission ?? session?.claims?.permissions;
    if (Array.isArray(values)) return new Set(values.map(String));
    if (values && typeof values === "object") {
      return new Set(Object.entries(values).filter(([, granted]) => granted === true).map(([key]) => key));
    }
    return new Set();
  }

  function policyAllowsNameEdit(access, name) {
    if (!name || !access || typeof access !== "object") return false;
    const editors = access.studentNameEditors ?? access.nameEditors ?? access.nameOverride;
    if (Array.isArray(editors)) return editors.includes(name);
    return Boolean(editors && typeof editors === "object" && editors[name] === true);
  }

  function resolve(options = {}) {
    const windowSession = options.session && typeof options.session === "object" ? options.session : null;
    const storedSession = readJsonStorage(options.localStorage, "hse-session") ||
      readJsonStorage(options.sessionStorage, "hse-session") ||
      readJsonStorage(options.localStorage, "gfield-session") ||
      readJsonStorage(options.sessionStorage, "gfield-session");
    const session = windowSession || storedSession;
    const directSessionName = sessionName(session);
    const fieldsName = trimName(readStorage(options.sessionStorage, "gf_n"));
    const middleName = readStorage(options.localStorage, "hs-code")
      ? trimName(readStorage(options.localStorage, "hs-student"))
      : "";
    const queryName = trimName(new URLSearchParams(options.search || "").get("student"));
    const legacyName = trimName(readStorage(options.localStorage, "hseStudent"));

    let name = directSessionName;
    let source = name ? "elementary-session" : "";
    if (!name && fieldsName) { name = fieldsName; source = "fields-session"; }
    if (!name && middleName) { name = middleName; source = "middle-session"; }
    if (!name && queryName) { name = queryName; source = "launch-link"; }
    if (!name && legacyName) { name = legacyName; source = "legacy"; }

    const permissions = permissionSet(session);
    const canEditName = Boolean(
      name && (
        session?.canEditStudentName === true ||
        permissions.has(NAME_EDIT_PERMISSION) ||
        policyAllowsNameEdit(options.access, name)
      )
    );

    return {
      name,
      source,
      canEditName,
      isLoggedIn: ["elementary-session", "fields-session", "middle-session"].includes(source)
    };
  }

  const api = { NAME_EDIT_PERMISSION, resolve, trimName };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.HSE_IDENTITY = api;
})();
