console.log("Hello via Bun!");


const ANISSIA_API_URL = "https://api.anissia.net/anime/";


(async()=>{
    
    const nowWeekDay = new Date().getDay()
     await fetch(`${ANISSIA_API_URL}/schedule/${nowWeekDay}`).then(res=> res.json()).then(json=> console.log(json))
})()

