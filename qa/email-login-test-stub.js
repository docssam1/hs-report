'use strict';
// QA 전용: 학부모 이메일 인증 단계(hs-email-login.js)를 "이미 인증된 브라우저"로 취급한다.
// 운영 코드에는 우회 플래그가 없다. 이 파일은 Playwright 브라우저에만 init script 를 넣어
// GFIELD_EMAIL_LOGIN.check / prompt 만 대체하므로, 각 페이지의 기존 이름·명단·회차·권한 검사는 그대로 실행된다.
// 이메일 인증 자체를 검증할 때는 GFIELD_QA_REAL_EMAIL_LOGIN=1 로 끈다.
const modules = [process.env.GFIELD_QA_PLAYWRIGHT || 'playwright', 'playwright', 'playwright-core']
  .filter((name, index, all) => all.indexOf(name) === index)
  .map((name) => { try { return require(name); } catch (e) { return null; } })
  .filter(Boolean);

function stubScript() {
  let real;
  try {
    Object.defineProperty(window, 'GFIELD_EMAIL_LOGIN', {
      configurable: true,
      get() { return real; },
      set(value) {
        real = value && Object.assign({}, value, {
          check: async () => ({ ok: true, qaStub: true }),
          prompt: async () => ({ qaStub: true }),
        });
      },
    });
  } catch (e) { /* already defined */ }
}

async function install(target) {
  if (!target || target.__gfieldEmailStub) return target;
  target.__gfieldEmailStub = true;
  await target.addInitScript(stubScript);
  return target;
}

function wrapBrowser(browser) {
  if (!browser || browser.__gfieldEmailStub) return browser;
  browser.__gfieldEmailStub = true;
  const newContext = browser.newContext.bind(browser);
  const newPage = browser.newPage.bind(browser);
  browser.newContext = async (...args) => install(await newContext(...args));
  browser.newPage = async (...args) => install(await newPage(...args));
  return browser;
}

function patch() {
  if (process.env.GFIELD_QA_REAL_EMAIL_LOGIN === '1') return;
  for (const playwright of modules) for (const name of ['chromium', 'firefox', 'webkit']) {
    const type = playwright[name];
    if (!type || type.__gfieldEmailStub) continue;
    type.__gfieldEmailStub = true;
    const launch = type.launch.bind(type);
    const launchPersistentContext = type.launchPersistentContext.bind(type);
    type.launch = async (...args) => wrapBrowser(await launch(...args));
    type.launchPersistentContext = async (...args) => install(await launchPersistentContext(...args));
  }
}

patch();
module.exports = { patch, install, stubScript };
