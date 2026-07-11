import * as cheerio from "cheerio";
import type {
  HTMLAnalysis,
  JSAnalysis,
  HiddenIframe,
  SuspiciousForm,
  MetaRedirect,
  ExternalResource,
  SecurityHeaders,
  TechnologyFingerprint,
  MalwareIndicator,
} from "@cyberguard/types";

interface HTMLScanResult {
  htmlAnalysis: HTMLAnalysis;
  jsAnalysis: JSAnalysis;
  technologies: TechnologyFingerprint[];
  indicators: MalwareIndicator[];
}

export async function analyzeHTML(html: string, _url: string): Promise<HTMLScanResult> {
  const $ = cheerio.load(html);
  const indicators: MalwareIndicator[] = [];
  let indicatorId = 1;

  // Analyze hidden iframes
  const hiddenIframes: HiddenIframe[] = [];
  $("iframe").each((_i, el) => {
    const style = $(el).attr("style") ?? "";
    const width = $(el).attr("width") ?? "";
    const height = $(el).attr("height") ?? "";
    const src = $(el).attr("src") ?? "";

    const isHidden =
      style.includes("display:none") ||
      style.includes("display: none") ||
      style.includes("visibility:hidden") ||
      style.includes("visibility: hidden") ||
      width === "0" ||
      height === "0" ||
      style.includes("position:absolute") && (width === "1" || height === "1");

    if (isHidden) {
      hiddenIframes.push({ src, width, height, style, position: "hidden" });
      indicators.push({
        id: `ind-${indicatorId++}`,
        category: "hidden_iframe",
        severity: "high",
        title: "Hidden iframe detected",
        description: `An invisible iframe was found loading content from: ${src}`,
        evidence: $.html(el)?.slice(0, 200) ?? "",
        location: `html:iframe[${_i}]`,
        recommendation: "Remove hidden iframe and investigate the source domain.",
      });
    }
  });

  // Analyze suspicious forms
  const suspiciousForms: SuspiciousForm[] = [];
  $("form").each((_i, el) => {
    const action = $(el).attr("action") ?? "";
    const method = ($(el).attr("method") ?? "GET").toUpperCase();
    const fields: string[] = [];
    let hasPasswordField = false;
    let hasEmailField = false;

    $(el).find("input").each((_j, input) => {
      const type = ($(input).attr("type") ?? "text").toLowerCase();
      const name = $(input).attr("name") ?? "";
      fields.push(`${name}(${type})`);
      if (type === "password") hasPasswordField = true;
      if (type === "email" || name.includes("email")) hasEmailField = true;
    });

    let externalAction = false;
    try {
      if (action && !action.startsWith("/") && !action.startsWith("#")) {
        const actionUrl = new URL(action);
        const pageUrl = new URL(_url);
        externalAction = actionUrl.hostname !== pageUrl.hostname;
      }
    } catch {
      externalAction = false;
    }

    const suspicious = hasPasswordField && externalAction;
    if (suspicious) {
      suspiciousForms.push({ action, method, fields, hasPasswordField, hasEmailField, externalAction });
      indicators.push({
        id: `ind-${indicatorId++}`,
        category: "credential_harvesting",
        severity: "critical",
        title: "Potential credential harvesting form",
        description: `A form with password fields submits data to an external domain: ${action}`,
        evidence: `Action: ${action}, Method: ${method}, Fields: ${fields.join(", ")}`,
        location: `html:form[${_i}]`,
        recommendation: "Ensure form actions only submit to the same origin over HTTPS.",
      });
    }
  });

  // Analyze meta redirects
  const metaRedirects: MetaRedirect[] = [];
  $('meta[http-equiv="refresh"]').each((_i, el) => {
    const content = $(el).attr("content") ?? "";
    const match = content.match(/url=(.+)/i);
    if (match?.[1]) {
      const delay = parseInt(content.match(/(\d+)/)?.[1] ?? "0", 10);
      metaRedirects.push({ content, target: match[1], delay });
      if (delay < 3) {
        indicators.push({
          id: `ind-${indicatorId++}`,
          category: "malicious_redirect",
          severity: "high",
          title: "Rapid meta redirect detected",
          description: `Page redirects to ${match[1]} with ${delay}s delay`,
          evidence: `<meta http-equiv="refresh" content="${content}">`,
          location: "html:head",
          recommendation: "Investigate redirect target and remove if malicious.",
        });
      }
    }
  });

  // Analyze external resources
  const externalResources: ExternalResource[] = [];
  const pageDomain = new URL(_url).hostname;

  $('script[src]').each((_i, el) => {
    const src = $(el).attr("src") ?? "";
    try {
      const srcUrl = new URL(src, _url);
      if (srcUrl.hostname !== pageDomain) {
        externalResources.push({
          type: "script",
          url: src,
          domain: srcUrl.hostname,
          isKnown: isKnownDomain(srcUrl.hostname),
        });
      }
    } catch { /* skip invalid URLs */ }
  });

  // Security headers analysis (will be populated from HTTP response)
  const securityHeaders: SecurityHeaders = {
    contentTypeOptions: null,
    xFrameOptions: null,
    strictTransportSecurity: null,
    contentSecurityPolicy: null,
    xXssProtection: null,
    referrerPolicy: null,
    permissionsPolicy: null,
  };

  // Technology fingerprinting
  const technologies = detectTechnologies($, html);

  const htmlAnalysis: HTMLAnalysis = {
    hiddenIframes,
    suspiciousForms,
    metaRedirects,
    externalResources,
    securityHeaders,
    doctype: html.toLowerCase().includes("<!doctype html>") ? "HTML5" : null,
    title: $("title").text() ?? null,
    formsCount: $("form").length,
    linksCount: $("a").length,
    imagesCount: $("img").length,
  };

  const jsAnalysis = analyzeJavaScript($);

  return { htmlAnalysis, jsAnalysis, technologies, indicators };
}

function analyzeJavaScript($: cheerio.CheerioAPI): JSAnalysis {
  const allScripts = $("script").toArray();
  const externalScripts = $('script[src]').length;
  const inlineScripts = allScripts.length - externalScripts;

  let obfuscatedCount = 0;
  const suspiciousPatterns: string[] = [];
  const obfuscatedSnippets: string[] = [];
  let evalUsage = false;
  let documentWrite = false;
  let base64Encoded = false;

  $("script:not([src])").each((_i, el) => {
    const content = $(el).html() ?? "";

    if (content.includes("eval(") || content.includes("eval (")) {
      evalUsage = true;
      suspiciousPatterns.push("eval()");
      obfuscatedCount++;
    }
    if (content.includes("document.write(")) {
      documentWrite = true;
      suspiciousPatterns.push("document.write()");
    }
    if (content.includes("atob(") || content.match(/^[A-Za-z0-9+/]{40,}={0,2}$/m)) {
      base64Encoded = true;
      suspiciousPatterns.push("base64 encoding");
      obfuscatedSnippets.push(content.slice(0, 100));
    }
    if ((content.match(/\\x[0-9a-f]{2}/gi)?.length ?? 0) > 10) {
      suspiciousPatterns.push("hex encoding");
      obfuscatedCount++;
    }
    if ((content.match(/\\u[0-9a-f]{4}/gi)?.length ?? 0) > 10) {
      suspiciousPatterns.push("unicode escape");
      obfuscatedCount++;
    }
    if (content.includes("String.fromCharCode")) {
      suspiciousPatterns.push("String.fromCharCode");
      obfuscatedCount++;
    }
  });

  const externalDomains: string[] = [];
  $('script[src]').each((_i, el) => {
    try {
      const src = $(el).attr("src") ?? "";
      const domain = new URL(src).hostname;
      if (!externalDomains.includes(domain)) {
        externalDomains.push(domain);
      }
    } catch { /* skip */ }
  });

  return {
    totalScripts: allScripts.length,
    externalScripts,
    inlineScripts,
    obfuscatedCount,
    suspiciousPatterns,
    obfuscatedSnippets,
    externalDomains,
    evalUsage,
    documentWrite,
    base64Encoded,
  };
}

function detectTechnologies($: cheerio.CheerioAPI, html: string): TechnologyFingerprint[] {
  const techs: TechnologyFingerprint[] = [];

  if (html.includes("react") || html.includes("__NEXT_DATA__")) {
    techs.push({ name: "React", version: null, category: "Framework", confidence: 80, cveCount: 0 });
  }
  if (html.includes("__NEXT_DATA__")) {
    techs.push({ name: "Next.js", version: null, category: "Framework", confidence: 90, cveCount: 0 });
  }
  if (html.includes("jquery") || html.includes("jQuery")) {
    const versionMatch = html.match(/jquery[.-](\d+\.\d+\.\d+)/);
    techs.push({ name: "jQuery", version: versionMatch?.[1] ?? null, category: "Library", confidence: 85, cveCount: 0 });
  }
  if (html.includes("bootstrap")) {
    techs.push({ name: "Bootstrap", version: null, category: "CSS Framework", confidence: 75, cveCount: 0 });
  }
  if (html.includes("wordpress") || html.includes("wp-content")) {
    techs.push({ name: "WordPress", version: null, category: "CMS", confidence: 85, cveCount: 0 });
  }
  if ($('meta[name="generator"]').attr("content")) {
    const gen = $('meta[name="generator"]').attr("content") ?? "";
    techs.push({ name: gen.split(" ")[0] ?? gen, version: gen.split(" ").slice(1).join(" "), category: "Generator", confidence: 70, cveCount: 0 });
  }

  return techs;
}

function isKnownDomain(domain: string): boolean {
  const knownDomains = [
    "cdn.jsdelivr.net", "cdnjs.cloudflare.com", "unpkg.com",
    "fonts.googleapis.com", "ajax.googleapis.com", "code.jquery.com",
  ];
  return knownDomains.includes(domain);
}
