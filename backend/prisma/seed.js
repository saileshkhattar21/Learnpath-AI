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

// Reads a JSON file relative to prisma/seed/. Returns [] (and logs why)
// instead of throwing when a file is missing, empty, or not valid JSON —
// several seed files aren't filled in yet and that shouldn't block the rest.
async function readJsonSafe(relativePath) {
  const fullPath = path.join(seedDir, relativePath);

  try {
    const raw = await fs.readFile(fullPath, "utf8");

    if (!raw.trim()) {
      console.log(`[seed] ${relativePath} is empty, skipping`);
      return [];
    }

    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log(`[seed] ${relativePath} not found, skipping`);
    } else {
      console.warn(`[seed] couldn't parse ${relativePath}:`, err.message);
    }

    return [];
  }
}

async function seedLevels() {
  const levels = await readJsonSafe("levels.json");
  console.log(`[seed] levels: ${levels.length}`);

  for (const level of levels) {
    await prisma.level.upsert({
      where: { slug: level.slug },

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

  console.log("[seed] levels done");
}

async function seedSkills() {
  const skills = await readJsonSafe("skills.json");
  console.log(`[seed] skills: ${skills.length}`);

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { slug: skill.slug },

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

  console.log("[seed] skills done");
}

async function seedTracks() {
  const tracks = await readJsonSafe("tracks.json");
  console.log(`[seed] tracks: ${tracks.length}`);

  for (const track of tracks) {
    await prisma.track.upsert({
      where: { slug: track.slug },

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

  console.log("[seed] tracks done");
}

async function seedTrackSkills() {
  const trackSkills = await readJsonSafe("track-skills.json");
  console.log(`[seed] track-skills: ${trackSkills.length}`);

  for (const ts of trackSkills) {
    await prisma.trackSkill.upsert({
      where: {
        trackId_skillId: {
          trackId: ts.track_id,
          skillId: ts.skill_id,
        },
      },

      update: {},

      create: {
        trackId: ts.track_id,
        skillId: ts.skill_id,
      },
    });
  }

  console.log("[seed] track-skills done");
}

async function seedTrackPrerequisites() {
  const prereqs = await readJsonSafe("track-prerequisites.json");
  console.log(`[seed] track-prerequisites: ${prereqs.length}`);

  for (const p of prereqs) {
    await prisma.trackPrerequisite.upsert({
      where: {
        trackId_skillId: {
          trackId: p.track_id,
          skillId: p.skill_id,
        },
      },

      update: {
        importance: p.importance,
      },

      create: {
        trackId: p.track_id,
        skillId: p.skill_id,
        importance: p.importance,
      },
    });
  }

  console.log("[seed] track-prerequisites done");
}

async function seedCoursesAndSections() {
  for (const trackKey of TRACK_FILES) {
    const courses = await readJsonSafe(`courses/${trackKey}.json`);

    console.log(`[seed] courses/${trackKey}.json: ${courses.length} courses`);

    for (const course of courses) {
      await prisma.course.upsert({
        where: { slug: course.slug },

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
        await prisma.section.upsert({
          where: {
            courseId_slug: {
              courseId: section.course_id,
              slug: section.slug,
            },
          },

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

  console.log("[seed] courses & sections done");
}

async function seedSectionSkills() {
  const sectionSkills = await readJsonSafe("section-skills.json");
  console.log(`[seed] section-skills: ${sectionSkills.length}`);

  for (const ss of sectionSkills) {
    await prisma.sectionSkill.upsert({
      where: {
        sectionId_skillId: {
          sectionId: ss.section_id,
          skillId: ss.skill_id,
        },
      },

      update: {},

      create: {
        sectionId: ss.section_id,
        skillId: ss.skill_id,
      },
    });
  }

  console.log("[seed] section-skills done");
}

async function seedQuestions() {
  for (const trackKey of TRACK_FILES) {
    const questions = await readJsonSafe(`questions/${trackKey}.json`);

    console.log(
      `[seed] questions/${trackKey}.json: ${questions.length} questions`,
    );

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

  console.log("[seed] questions & options done");
}

async function seedVideos() {
  for (const trackKey of TRACK_FILES) {
    const videos = await readJsonSafe(`videos/${trackKey}.json`);

    console.log(`[seed] videos/${trackKey}.json: ${videos.length} videos`);

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

  console.log("[seed] videos done");
}

async function seedResources() {
  for (const trackKey of TRACK_FILES) {
    const resources = await readJsonSafe(`resources/${trackKey}.json`);

    console.log(
      `[seed] resources/${trackKey}.json: ${resources.length} resources`,
    );

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

  console.log("[seed] resources done");
}

async function main() {
  console.log("[seed] starting...");

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

  console.log("[seed] all done ✅");
}

main()
  .catch((err) => {
    console.error("[seed] failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
