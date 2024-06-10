import db from "./util/db";
const ANISSIA_API_URL = "https://api.anissia.net/anime/";

interface DayAnimation {
  week: string;
  animeNo: number;
  status: string;
  time: string;
  subject: string;
  genres: string;
  captionCount: number;
  startDate: string;
  endDate: string;
  website: string;
}

interface AnissiaDetail {
  episode: string;
  updDt: string;
  website: string;
  name: string;
}

(async () => {
  const nowDayOfWeek = new Date().getDay();
  const dayAnimations = (await (
    await fetch(`${ANISSIA_API_URL}/schedule/${nowDayOfWeek}`)
  ).json()) as { code: string; data: DayAnimation[] };

  /* if (dayAnimations.code === "ok") {
    const anissiaDetails = await Promise.all(
      dayAnimations.data.map(async (ani: DayAnimation) => {
        const aniDetail = (await (
          await fetch(`${ANISSIA_API_URL}/caption/animeNo/${ani.animeNo}`)
        ).json()) as { code: string; data: AnissiaDetail[] };
        if (aniDetail.code === "ok") {
          return { animeNo: ani.animeNo, ...aniDetail.data[0] };
        }
      })
    );
  } */
  if (dayAnimations.code === "ok" && dayAnimations.data.length > 1) {
    for (let animation of dayAnimations.data) {
      await db.animation.upsert({
        where: {
          animeNo: animation.animeNo,
        },
        update: {
          status: animation.status,
        },
        create: {
          animeNo: animation.animeNo,
          name: animation.subject,
          status: animation.status,
          website: animation.website,
          genres: animation.genres,
        },
      });
    }
  }

  /* */
})();
