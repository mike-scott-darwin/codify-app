import { ReferenceFile, ContextScore } from "./types";

const CORE_FILES = [
  { name: "soul.md", label: "Soul", maxScore: 25, path: "reference/core/soul.md" },
  { name: "offer.md", label: "Offer", maxScore: 25, path: "reference/core/offer.md" },
  { name: "audience.md", label: "Audience", maxScore: 25, path: "reference/core/audience.md" },
  { name: "voice.md", label: "Voice", maxScore: 25, path: "reference/core/voice.md" },
];

function scoreContent(content: string | undefined, maxScore: number): { score: number; status: ReferenceFile["status"] } {
  if (!content) return { score: 0, status: "missing" };
  
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const hasHeadings = (content.match(/^#{1,3}\s/gm) || []).length;
  const hasSections = hasHeadings >= 3;
  const hasSubstance = wordCount > 200;
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

export function calculateContextScore(files: Array<{ name: string; path: string; content?: string; lastModified?: string }>): ContextScore {
  const scored: ReferenceFile[] = CORE_FILES.map(coreDef => {
    const found = files.find(f => f.path === coreDef.path || f.name === coreDef.name);
    const content = found?.content;
    const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;
    const { score, status } = found ? scoreContent(content, coreDef.maxScore) : { score: 0, status: "missing" as const };
    
    return {
      name: coreDef.name,
      path: coreDef.path,
      exists: !!found,
      content,
      wordCount,
      lastModified: found?.lastModified,
      score,
      maxScore: coreDef.maxScore,
      status,
    };
  });

  const total = scored.reduce((sum, f) => sum + f.score, 0);
  const maxTotal = scored.reduce((sum, f) => sum + f.maxScore, 0);
  const percentage = Math.round((total / maxTotal) * 100);
  
  let grade: string;
  if (percentage >= 80) grade = "A";
  else if (percentage >= 60) grade = "B";
  else if (percentage >= 40) grade = "C";
  else if (percentage >= 20) grade = "D";
  else grade = "F";

  const recommendations: string[] = [];
  for (const file of scored) {
    if (file.status === "missing") {
      recommendations.push(`Create ${file.name} — this is a core file that drives all AI outputs`);
    } else if (file.status === "skeleton") {
      recommendations.push(`Flesh out ${file.name} — it needs more substance to be useful`);
    } else if (file.status === "draft") {
      recommendations.push(`Enrich ${file.name} — add specific examples and deeper detail`);
    }
  }

  return { total, maxTotal, percentage, grade, files: scored, recommendations };
}

export { CORE_FILES };
