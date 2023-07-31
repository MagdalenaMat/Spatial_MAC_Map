const admin = require("firebase-admin");

async function getAllSlides() {
    const slides = await admin.firestore().collection("slides").get();

    let allSlides = []; 
    for(let i = 0; i < slides.docs.length; i++) {
        const buf = slides.docs[i].data()
        if(!buf.details){
            buf.details = {
                description: "",
                annotations: [],
            }
        }
        allSlides.push(buf);
    }

    return allSlides; 
}

module.exports = getAllSlides;