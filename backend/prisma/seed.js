import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedDir = path.join(__dirname, "seed");

const TRACK_FILES = [
  "frontend",
  "backend",
  "devops-cloud",
  "relational-databases",
  "ai-ml",
  "data-analytics",
];

// Reads a JSON file relative to prisma/seed/. Returns []
// instead of throwing when a file is missing, empty, or not valid JSON —
// several seed files aren't filled in yet and that shouldn't block the rest.
async function readJsonSafe(relativePath) {
  const fullPath = path.join(seedDir, relativePath);
  try {
    const raw = await fs.readFile(fullPath, "utf8");
    if (!raw.trim()) {
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

async function seedLevels() {
  const levels = await readJsonSafe("levels.json");
  const seenSlugs = new Map();
  const seenRanks = new Map();
  for (const level of levels) {
    if (seenSlugs.has(level.slug)) {
      continue;
    }
    if (seenRanks.has(level.rank)) {
      continue;
    }
    seenSlugs.set(level.slug, level.id);
    seenRanks.set(level.rank, level.id);

    await prisma.level.upsert({
      where: { id: level.id },
      update: {
        slug: level.slug,
        name: level.name,
        rank: level.rank,
        description: level.description ?? null,
      },
      create: {
        id: level.id,
        slug: level.slug,
        name: level.name,
        rank: level.rank,
        description: level.description ?? null,
      },
    });
  }
}

async function seedSkills() {
  const skills = await readJsonSafe("skills.json");
  const seenSlugs = new Map();
  for (const skill of skills) {
    if (seenSlugs.has(skill.slug)) {
      continue;
    }
    seenSlugs.set(skill.slug, skill.id);

    await prisma.skill.upsert({
      where: { id: skill.id },
      update: {
        slug: skill.slug,
        name: skill.name,
        description: skill.description ?? null,
      },
      create: {
        id: skill.id,
        slug: skill.slug,
        name: skill.name,
        description: skill.description ?? null,
      },
    });
  }
}

async function seedTracks() {
  const tracks = await readJsonSafe("tracks.json");
  const seenSlugs = new Map();
  for (const track of tracks) {
    if (seenSlugs.has(track.slug)) {
      continue;
    }
    seenSlugs.set(track.slug, track.id);

    await prisma.track.upsert({
      where: { id: track.id },
      update: {
        slug: track.slug,
        name: track.name,
        description: track.description ?? null,
        displayOrder: track.display_order,
      },
      create: {
        id: track.id,
        slug: track.slug,
        name: track.name,
        description: track.description ?? null,
        displayOrder: track.display_order,
      },
    });
  }
}

async function seedTrackSkills() {
  const trackSkills = await readJsonSafe("track-skills.json");
  for (const ts of trackSkills) {
    await prisma.trackSkill.upsert({
      where: {
        trackId_skillId: { trackId: ts.track_id, skillId: ts.skill_id },
      },
      update: {},
      create: { trackId: ts.track_id, skillId: ts.skill_id },
    });
  }
}

async function seedTrackPrerequisites() {
  const prereqs = await readJsonSafe("track-prerequisites.json");
  for (const p of prereqs) {
    await prisma.trackPrerequisite.upsert({
      where: { trackId_skillId: { trackId: p.track_id, skillId: p.skill_id } },
      update: { importance: p.importance },
      create: {
        trackId: p.track_id,
        skillId: p.skill_id,
        importance: p.importance,
      },
    });
  }
}

async function seedCoursesAndSections() {
  // Declared outside the per-file loop on purpose — duplicates can happen
  // ACROSS track files too (e.g. the same course/section slug typo'd into
  // both frontend.json and backend.json), so the dedupe needs to span the
  // whole function, not reset for every file.
  const seenCourseSlugs = new Map();
  const seenSectionSlugs = new Map(); // key: `${courseId}:${slug}`

  for (const trackKey of TRACK_FILES) {
    const courses = await readJsonSafe(`courses/${trackKey}.json`);
    for (const course of courses) {
      if (seenCourseSlugs.has(course.slug)) {
        continue;
      }
      seenCourseSlugs.set(course.slug, course.id);

      await prisma.course.upsert({
        where: { id: course.id },
        update: {
          trackId: course.track_id,
          levelId: course.level_id,
          slug: course.slug,
          title: course.title,
          description: course.description ?? null,
          displayOrder: course.display_order,
        },
        create: {
          id: course.id,
          trackId: course.track_id,
          levelId: course.level_id,
          slug: course.slug,
          title: course.title,
          description: course.description ?? null,
          displayOrder: course.display_order,
        },
      });

      const sections = course.sections ?? [];
      for (const section of sections) {
        const key = `${section.course_id}:${section.slug}`;
        if (seenSectionSlugs.has(key)) {
          continue;
        }
        seenSectionSlugs.set(key, section.id);

        await prisma.section.upsert({
          where: { id: section.id },
          update: {
            courseId: section.course_id,
            title: section.title,
            slug: section.slug,
            description: section.description ?? null,
            displayOrder: section.display_order,
            learningObjectives: section.learning_objectives ?? undefined,
          },
          create: {
            id: section.id,
            courseId: section.course_id,
            title: section.title,
            slug: section.slug,
            description: section.description ?? null,
            displayOrder: section.display_order,
            learningObjectives: section.learning_objectives ?? undefined,
          },
        });
      }
    }
  }
}

async function seedSectionSkills() {
  const sectionSkills = await readJsonSafe("section-skills.json");
  for (const ss of sectionSkills) {
    await prisma.sectionSkill.upsert({
      where: {
        sectionId_skillId: { sectionId: ss.section_id, skillId: ss.skill_id },
      },
      update: {},
      create: { sectionId: ss.section_id, skillId: ss.skill_id },
    });
  }
}

async function seedQuestions() {
  for (const trackKey of TRACK_FILES) {
    const questions = await readJsonSafe(`questions/${trackKey}.json`);
    for (const q of questions) {
      await prisma.question.upsert({
        where: { id: q.id },
        update: {
          sectionId: q.section_id,
          levelId: q.level_id,
          question: q.question,
          explanation: q.explanation ?? null,
          displayOrder: q.display_order,
        },
        create: {
          id: q.id,
          sectionId: q.section_id,
          levelId: q.level_id,
          question: q.question,
          explanation: q.explanation ?? null,
          displayOrder: q.display_order,
        },
      });

      const options = q.options ?? [];
      for (const opt of options) {
        await prisma.questionOption.upsert({
          where: { id: opt.id },
          update: {
            questionId: q.id,
            text: opt.text,
            isCorrect: opt.is_correct,
          },
          create: {
            id: opt.id,
            questionId: q.id,
            text: opt.text,
            isCorrect: opt.is_correct,
          },
        });
      }
    }
  }
}

async function seedVideos() {
  for (const trackKey of TRACK_FILES) {
    const videos = await readJsonSafe(`videos/${trackKey}.json`);
    for (const v of videos) {
      await prisma.video.upsert({
        where: { id: v.id },
        update: {
          sectionId: v.section_id,
          title: v.title,
          description: v.description ?? null,
          url: v.url,
          channel: v.channel,
        },
        create: {
          id: v.id,
          sectionId: v.section_id,
          title: v.title,
          description: v.description ?? null,
          url: v.url,
          channel: v.channel,
        },
      });
    }
  }
}

async function seedResources() {
  for (const trackKey of TRACK_FILES) {
    const resources = await readJsonSafe(`resources/${trackKey}.json`);
    for (const r of resources) {
      await prisma.resource.upsert({
        where: { id: r.id },
        update: {
          sectionId: r.section_id,
          title: r.title,
          description: r.description ?? null,
          url: r.url,
          source: r.source,
          type: r.type,
        },
        create: {
          id: r.id,
          sectionId: r.section_id,
          title: r.title,
          description: r.description ?? null,
          url: r.url,
          source: r.source,
          type: r.type,
        },
      });
    }
  }
}

async function main() {
  // Order matters: rows must exist before anything else references them.
  await seedLevels();
  await seedSkills();
  await seedTracks();
  await seedTrackSkills();
  await seedTrackPrerequisites();
  await seedCoursesAndSections();
  await seedSectionSkills();
  await seedQuestions();
  await seedVideos();
  await seedResources();

}

main()
  .catch(() => {
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
