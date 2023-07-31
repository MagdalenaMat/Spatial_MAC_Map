const admin = require("firebase-admin");

async function saveSlideDetails(details) {
    const db = admin.firestore();
    const slidesRef = db.collection('slides');
    
    const snapshot = await slidesRef.where('dzi', '==', details.dzi).get();

    if (snapshot.empty) {
        console.log('No matching documents.');
        return "failed";
    }

    const doc = snapshot.docs[0].ref; 

    await doc.update({
        details: {
            description: details.description,
            annotations: details.annotations,
        }
    });
    return "success";
}

module.exports = saveSlideDetails;