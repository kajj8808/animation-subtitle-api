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

async function autoSaveAnissiaDataToDB() {
  // const nowDayOfWeek = new Date().getDay();
  // 0-6 요일 | 7 기타 | 8 신작
  for (let day = 0; day <= 6; day++) {
    const anissiaDayAnimations = (await (
      await fetch(`${ANISSIA_API_URL}/schedule/${day}`)
    ).json()) as { code: string; data: DayAnimation[] };

    if (
      anissiaDayAnimations.code === "ok" &&
      anissiaDayAnimations.data.length > 1
    ) {
      for (let anissiaAnimation of anissiaDayAnimations.data) {
        await db.animation.upsert({
          where: {
            animeNo: anissiaAnimation.animeNo,
          },
          update: {
            status: anissiaAnimation.status,
          },
          create: {
            animeNo: anissiaAnimation.animeNo,
            name: anissiaAnimation.subject,
            status: anissiaAnimation.status,
            website: anissiaAnimation.website,
            genres: anissiaAnimation.genres,
          },
        });
        const anissiaAnimationDetails = (await (
          await fetch(
            `${ANISSIA_API_URL}/caption/animeNo/${anissiaAnimation.animeNo}`
          )
        ).json()) as { code: string; data: AnissiaDetail[] };
        if (
          (anissiaAnimationDetails.code === "ok",
          anissiaAnimationDetails.data.length >= 1)
        ) {
          for (let anissiaAnimationDetail of anissiaAnimationDetails.data) {
            const isVaild =
              !Boolean(
                await db.subTitle.findFirst({
                  where: {
                    website: anissiaAnimationDetail.website,
                  },
                })
              ) && anissiaAnimationDetail.website !== "";
            // 중복이 아니거나 website가 있는 경우 유효하다 보고 db에 item 추가
            if (isVaild) {
              await db.subTitle.create({
                data: {
                  episode: anissiaAnimationDetail.episode,
                  uploader: anissiaAnimationDetail.name,
                  website: anissiaAnimationDetail.website,
                  updateAt: new Date(anissiaAnimationDetail.updDt),
                  animeNo: anissiaAnimation.animeNo,
                },
              });
            }
          }
        }
      }
    }
  }
}

(async () => {
  console.log("anissia api 에서 데이터를 불러와 DB에 저장중 입니다...");
  await autoSaveAnissiaDataToDB();
  console.log(
    "anissia api 에서 가져온 최신 자막 데이터를 저장하는데 성공 하였습니다."
  );
})();
