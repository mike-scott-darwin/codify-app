import { ReferenceFile, ContextScore, ReferenceCategory, CORE_FILE_KEYS } from "./types";

// Core files are required and weighted heavily (20 pts each = 80 pts)
// Domain/proof/brand files earn bonus points (5 pts each, up to 20 pts total)
const CORE_MAX_SCORE = 20;
const BONUS_MAX_SCORE = 5;
const BONUS_CAP = 20; // max bonus from non-core files

function scoreContent(content: string | undefined, maxScore: number): { score: number; status: ReferenceFile["status"] } {
  if (!content) return { score: 0, status: "missing" };
  
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const hasHeadings = (content.match(/^#{1,3}\s/gm) || []).length;
  const hasSections = hasHeadings >= 3;
  const hasDepth = wordCount > 500;
  const hasSpecificity = /\b(because|specifically|for example|such as|unlike)\b/i.test(content);
  
  let ratio = 0;
  if (wordCount < 50) ratio = 0.15;
  else if (wordCount < 150) ratio = 0.3;
  else if (wordCount < 300) ratio = 0.5;
  else if (wordCount < 500) ratio = 0.7;
  else ratio = 0.85;
  
  if (hasSections) ratio += 0.05;
  if (hasSpecificity) ratio += 0.05;
  if (hasDepth) ratio += 0.05;
  
  ratio = Math.min(ratio, 1);
  const score = Math.round(maxScore * ratio);
  
  let status: ReferenceFile["status"];
  if (ratio < 0.2) status = "skeleton";
  else if (ratio < 0.5) status = "draft";
  else if (ratio < 0.8) status = "solid";
  else status = "strong";
  
  return { score, status };
}

function categorizeFile(path: string): ReferenceCategory {
  if (path.includes("reference/domain/")) return "domain";
  if (path.includes("reference/proof/")) return "proof";
  if (path.includes("reference/brand/")) return "brand";
  return "core";
}

export function calculateContextScore(
  files: Array<{ name: string; path: string; content?: string; lastModified?: string; category?: string }>
): ContextScore {
  const scored: ReferenceFile[] = [];
  const categoryCounts: Record<ReferenceCategory, number> = { core: 0, domain: 0, proof: 0, brand: 0 };

  // Score core files (required — create placeholders for missing ones)
  for (const key of CORE_FILE_KEYS) {
    const found = files.find(f => f.path === `reference/core/${key}.md` || f.name === `${key}.md`);
    const content = found?.content;
    const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;
    const { score, status } = found ? scoreContent(content, CORE_MAX_SCORE) : { score: 0, status: "missing" as const };

    scored.push({
      name: `${key}.md`,
      path: `reference/core/${key}.md`,
      category: "core",
      exists: !!found,
      content,
      wordCount,
      lastModified: found?.lastModified,
      score,
      maxScore: CORE_MAX_SCORE,
      status,
    });
    if (found) categoryCounts.core++;
  }

  // Score non-core files (bonus points)
  let bonusTotal = 0;
  const nonCoreFiles = files.filter(f => {
    const cat = f.category || categorizeFile(f.path);
    return cat !== "core" || !CORE_FILE_KEYS.some(k => f.name === `${k}.md`);
  });

  for (const file of nonCoreFiles) {
    const category = (file.category || categorizeFile(file.path)) as ReferenceCategory;
    const content = file.content;
    const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;
    const cappedMax = Math.min(BONUS_MAX_SCORE, BONUS_CAP - bonusTotal);
    if (cappedMax <= 0) {
      // Still track the file but no more score
      scored.push({
        name: file.name,
        path: file.path,
        category,
        exists: true,
        content,
        wordCount,
        lastModified: file.lastModified,
        score: 0,
        maxScore: 0,
        status: scoreContent(content, BONUS_MAX_SCORE).status,
      });
    } else {
      const { score, status } = scoreContent(content, cappedMax);
      bonusTotal += score;
      scored.push({
        name: file.name,
        path: file.path,
        category,
        exists: true,
        content,
        wordCount,
        lastModified: file.lastModified,
        score,
        maxScore: cappedMax,
        status,
      });
    }
    categoryCounts[category]++;
  }

  const maxTotal = CORE_FILE_KEYS.length * CORE_MAX_SCORE + BONUS_CAP; // 80 + 20 = 100
  const total = scored.reduce((sum, f) => sum + f.score, 0);
  const percentage = Math.round((total / maxTotal) * 100);

  let grade: string;
  if (percentage >= 80) grade = "A";
  else if (percentage >= 60) grade = "B";
  else if (percentage >= 40) grade = "C";
  else if (percentage >= 20) grade = "D";
  else grade = "F";

  const recommendations: string[] = [];
  for (const file of scored) {
    if (file.category === "core") {
      if (file.status === "missing") {
        recommendations.push(`Create ${file.name} — this is a core file that drives all AI outputs`);
      } else if (file.status === "skeleton") {
        recommendations.push(`Flesh out ${file.name} — it needs more substance to be useful`);
      } else if (file.status === "draft") {
        recommendations.push(`Enrich ${file.name} — add specific examples and deeper detail`);
      }
    }
  }

  // Suggest adding non-core files if none exist
  if (categoryCounts.domain === 0) {
    recommendations.push("Add a domain file (e.g. workflow.md) to capture how you work");
  }
  if (categoryCounts.proof === 0) {
    recommendations.push("Add a proof file (e.g. case-studies.md) to ground your outputs in real results");
  }

  return { total, maxTotal, percentage, grade, files: scored, recommendations, categoryCounts };
}

// Legacy export for backwards compatibility
const CORE_FILES = CORE_FILE_KEYS.map(key => ({
  name: `${key}.md`,
  label: key.charAt(0).toUpperCase() + key.slice(1),
  maxScore: CORE_MAX_SCORE,
  path: `reference/core/${key}.md`,
}));

export { CORE_FILES };
