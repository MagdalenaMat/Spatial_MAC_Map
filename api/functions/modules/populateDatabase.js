const {Storage} = require('@google-cloud/storage');
const admin = require("firebase-admin");

const serviceAccount = require("../firebase-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

const storage = new Storage();

async function addFilesToDatabase() {
    let [files] = await storage.bucket("spatial-mac-map").getFiles();

    files = files.filter(file => file.name.endsWith(".dzi"));

    let curatedFiles = files.map(file => {
        // let cleanName = file.name.replace("full_slide_images/", "");

        let cleanName = file.name; 
    
        let splitPath = cleanName.split("/");
        splitPath.pop(); // remove the last element
        let folder = splitPath.join("/"); // join the rest back together
    
        return {
            dzi: cleanName,
            folder: folder,
            name: cleanName.split("/").pop().split(".")[0],
        }
    });    

    return curatedFiles;
}

    // files.forEach(file => {
    //     console.log(file.name); 
    // }); 

// listFiles().catch(console.error);


(async () => {
    const files = await addFilesToDatabase();

    files.forEach(file => {
        if(file.folder.startsWith("figure_images/")) {
            console.log(file.dzi); 
            admin.firestore().collection("slides").doc().set({
                dzi: file.dzi,
                folder: file.folder,
                name: file.name,
            });
        }
    });
})();

