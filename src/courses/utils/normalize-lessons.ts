import { Lesson } from '../schemas/course.schema';

type MixedLesson = string | Lesson;

export function normalizeLessons(lessons: MixedLesson[]): Lesson[] {
  if (!Array.isArray(lessons)) return [];

  return lessons
    .map((l) => {
      if (typeof l === 'string') {
        const slug = l;
        return { slug, title: slug, content: '' } as Lesson;
      }
      // เป็น object อยู่แล้ว
      return {
        slug: l.slug,
        title: l.title ?? l.slug,
        content: l.content ?? '',
      } as Lesson;
    })
    .filter((l) => !!l.slug);
}

export function hasLesson(lessons: MixedLesson[], slug: string) {
  return normalizeLessons(lessons).some((l) => l.slug === slug);
}

export function findLesson(lessons: MixedLesson[], slug: string) {
  return normalizeLessons(lessons).find((l) => l.slug === slug) ?? null;
}