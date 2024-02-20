const admin = require("firebase-admin");

const serviceAccount = require("../firebase-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });


async function removeDatabaseEntries() {
    const slides = await admin.firestore().collection("slides").get();

    for(let i = 0; i < slides.docs.length; i++) {
        const slide = slides.docs[i];
        const slideData = slide.data();

        if(slideData.folder.startsWith("figure_images/")) {
            console.log("deleting", slideData.folder);
            await slide.ref.delete();
        }
    }

    console.log("done");
    return "done";
}

(async () => {
    await removeDatabaseEntries();
})(); 