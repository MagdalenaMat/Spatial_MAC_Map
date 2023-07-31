<template>
  <v-app>
    <v-app-bar color="primary">
      <v-select
          v-model="selectedFolder"
          :items="folderOptions"
          label="Folder">
        </v-select>
        <v-select
          v-model="selectedSampleDzi"
          :items="sampleOptions"
          item-title="name"
          item-value="dzi"
          label="Sample">
        </v-select>
        <v-btn>
          <router-link to="/files" style="color: white;">Study Files</router-link>
        </v-btn>
        <v-btn v-if="adminToken" @click="saveSlideAnnotations">
          Save
        </v-btn>
      </v-app-bar>
  
    <v-main class="d-flex relative-container">
      <div id="right-arrow-overlay" style="display: none;">
        <span style="font-size: 2em; color: white;">&rarr;</span>
      </div>
      <div id="view"></div>
      <div v-if="!isHomePage" id="slide-details">
        <h3>Description</h3>
        <p v-if="!adminToken">{{ selectedSample.details ? selectedSample.details.description : '' }}</p>
        <textarea v-else v-model="selectedSample.details.description" style="color: white;"></textarea>
        <div v-if="adminToken">
        <h3>Annotations</h3>
          <ul v-if="selectedSample.details">
            <li v-for="(overlay, index) in selectedSample.details.annotations" :key="index">
              <span style="color: white;">{{ overlay.number }}: </span>
              <textarea v-model="overlay.description" style="color: white;"></textarea>
              <button v-if="adminToken" @click="deleteOverlay(index)" style="background: none; border: none; color: white;">Delete</button>
            </li>
          </ul>
        </div>
        <h3>Colors</h3>
        <ul>
          <li v-for="(stain, index) in currentColors" :key="index" :style="{ color: stain.color }">
            Stain {{ index + 1 }}: {{ stain.stain }}
          </li>
        </ul>
        <a v-if="downloadLink" target="_blank" :href="downloadLink" download>Download slide</a> <br />
        <a v-if="selectedSampleUrl" target="_blank" :href="selectedSampleUrl">Current slide URL</a>
      </div>
      <div v-else id="home-view">
        <button @click="closeHomeView" class="close-button">X</button>
        <HomeView />
      </div>
    </v-main>

  </v-app>
</template>

<script>
import OpenSeadragon from "openseadragon";
import axios from "axios";

import HomeView from "../components/HomeView.vue";

const base_url = "https://storage.googleapis.com/spatial-mac-map";

const apiBaseUrl  = 
    process.env.NODE_ENV === "production"
      ? "https://api-tpv7omntkq-uc.a.run.app/graphql"
      : "http://127.0.0.1:5001/som-lms-methylation/us-central1/api/graphql";

export default {
  components: {
    HomeView
  },
  data() {
    return {
      selectedSample: {},
      selectedSampleName: "",
      selectedSampleDzi: "",
      selectedSampleUrl: "",
      selectedFolder: "",
      samples: [],
      currentColors: [],
      downloadLink: "",
      viewer: null,
      ch: {},
      ch_stain: {},
      gain: {},
      description: "",
      slideSettingsShown: false,
      colorOptions: [
        {
          letter: "R", 
          color: "red"
        }, 
        {
          letter: "P", 
          color: "purple"
        }, 
        {
          letter: "C", 
          color: "cyan"
        }, 
        {
          letter: "G", 
          color: "green"
        }, 
        {
          letter: "Y", 
          color: "yellow"
        }, 
        {
          letter: "O", 
          color: "orange"
        }, 
        {
          letter: "B", 
          color: "brown"
        }, 
        {
          letter: "W", 
          color: "white"
        }
      ],
      overlays: [],
      isHomePage: false,
      adminToken: ""
    }
  },
  computed: {
    sampleOptions() {
      return this.samples.filter(s => s.base_folder == this.selectedFolder);
    },
    folderOptions() {
      return [...new Set(this.samples.map(s => s.base_folder))];
    }
  },
  watch: {
    selectedSampleDzi: function () {
      this.loadSample();
    }
  },
  methods: {
    async getAllSlides() {
      const response = await axios.post(`${apiBaseUrl}`,{
        query: `{
          getAllSlides {
            name
            dzi
            folder
            details {
              description
              annotations {
                name
                description
                x
                y
                number
              }
            }
          }
        }`
      }).catch(e => console.log(e));

      return response.data.data.getAllSlides;
    },
    closeHomeView(){
      this.isHomePage = false;
    },
    loadOpenSeaDragon() {
      this.viewer = new OpenSeadragon({
        id: "view",
        prefixUrl: "images/",
        timeout: 120000,
        animationTime: 0.5,
        blendTime: 0.1,
        constrainDuringPan: true,
        maxZoomPixelRatio: 2,
        minZoomImageRatio: 1,
        visibilityRatio: 1,
        zoomPerScroll: 2,
        showNavigationControl: true,
        navigationControlAnchor: OpenSeadragon.ControlAnchor.TOP_LEFT,
        isHomePage: true,
      });

      this.viewer.addHandler('tile-drawn', () => {
      if (!this.mouseTrackerInitialized) {
        this.mouseTrackerInitialized = true;

        this.$nextTick(() => {
          new OpenSeadragon.MouseTracker({
            element: this.viewer.canvas,
            contextMenuHandler: e => {
              e.originalEvent.preventDefault();

              if(!this.adminToken) {
                return; 
              }

              const clickPosition = e.position;

              // Convert the click position to image coordinates
              const imageCoordinates = this.viewer.viewport.viewerElementToImageCoordinates(clickPosition);

              const elementCoordiantes = this.viewer.viewport.imageToViewportCoordinates(imageCoordinates);

              this.selectedSample.details.annotations.push({
                x: elementCoordiantes.x,
                y: elementCoordiantes.y,
                description: "", 
                number: this.selectedSample.details.annotations.length > 0 ? this.selectedSample.details.annotations.map(overlay => overlay.number).sort((a, b) => a - b)[this.selectedSample.details.annotations.length-1] + 1 : 1
              });

              this.addOverlay(elementCoordiantes.x, 
                elementCoordiantes.y, 
                this.selectedSample.details.annotations[this.selectedSample.details.annotations.length-1].number,
                this.selectedSample.details.annotations[this.selectedSample.details.annotations.length-1].description);
            },
            
          });

        });
      }
    });

    },

    addOverlay(x, y, number, description) {

      console.log("description: ", description);

      const overlayElement = document.createElement("div");
      overlayElement.className = "overlay-"+number; 
      overlayElement.innerHTML = '<span>'+(this.adminToken ? number : description.replace("\n", "<br />"))+'</span><span style="font-size: 2em; color: white;">&rarr;</span>';

      this.viewer.addOverlay({
        element: overlayElement,
        location: new OpenSeadragon.Point(x, y),
        placement: OpenSeadragon.Placement.RIGHT
      });

      new OpenSeadragon.MouseTracker({
        element: overlayElement,
        clickHandler: (event) => {
          event.originalEvent.preventDefault();
        },
      }).setTracking(true);
    },  

    deleteOverlay(index) {
      this.selectedSample.details.annotations.splice(index, 1);
      // this.selectedSample.details.annotations = this.selectedSample.details.annotations.maps((samp, index) => {
      //   const buf = samp; 
      //   buf.id = index + 1; 
      //   return buf; 
      // });
      this.reloadSlide();
    },

    saveSlideAnnotations() {
    const useQuery = `{
        saveSlideDetails(details:{dzi:"${this.selectedSample.dzi}", 
          description:"${this.selectedSample.details.description}",, 
          annotations:${JSON.stringify(this.selectedSample.details.annotations).replace(/"([^"]+)":/g, "$1:")}})
      }`;

    axios.post(`${apiBaseUrl}`, {
          query: useQuery
        }, {
          headers: {
            'Authorization': `Bearer ${this.adminToken}`
          }
        }).then((response) => {
          console.log(response);
        }).catch(e => console.log(e));
    },
    reloadSlide() {
      let currentSlide = `${base_url}/${this.selectedSampleDzi}`;
      this.downloadLink = currentSlide.slice(0, -4) + ".tif";
      this.selectedSampleUrl = `https://magdalenamat.github.io/Spatial_MAC_Map/#/?slide=${this.selectedSample.folder}`;
      this.viewer.open(currentSlide);

      for (let i = 0; i < this.selectedSample.details.annotations.length; i++) {
        this.addOverlay(this.selectedSample.details.annotations[i].x, this.selectedSample.details.annotations[i].y, 
        this.selectedSample.details.annotations[i].number,
        this.selectedSample.details.annotations[i].description);
      }
    },

    loadSample() {
      this.selectedSample = this.samples.filter(s => s.dzi === this.selectedSampleDzi)[0];

      try {
          this.currentColors = this.selectedSample.name.split("_").slice(1).filter(s => s.match(/[A-Z]$/) && s !== "BC" && s !== "CRC").map(s => {
              return {
                  stain: s.slice(0, -1),
                  letter: s.slice(-1),
                  color: this.colorOptions.filter(c => c.letter === s.slice(-1))[0].color
              };
          });
      } catch (e) {
          console.log(e);
      }


      this.currentColors.unshift({
            stain: "DAPI",
            letter: "X",
            color: "blue"
          }); 
      this.reloadSlide();
    }

  },
  mounted() {
    this.getAllSlides().then((samples) => {
      this.samples = samples;

      this.samples.sort((a, b) => {
        if(a.folder < b.folder) { return -1; }
        if(a.folder > b.folder) { return 1; }
        return 0;
      });

    this.samples = this.samples.map(s => {
      let folders = s.folder.split('/');
      folders.pop();
      return {
        ...s,
        base_folder: folders.join('/')
      }
    });

    this.loadOpenSeaDragon();

    if(this.$route.query.slide) {
      this.selectedSampleDzi = this.samples.filter(s => s.folder === this.$route.query.slide)[0].dzi;
      this.selectedFolder = this.samples.filter(s => s.folder === this.$route.query.slide)[0].base_folder;

    } else {
      // this.selectedSampleDzi = this.samples[0].dzi;
      // this.selectedFolder = this.samples[0].base_folder;

      this.selectedSampleDzi = this.samples.filter(s => s.folder === "Figure_images/FigS2C/LN_CRC_met_panCKC_FOLR2Y_IL4I1R")[0].dzi;
      this.selectedFolder = this.samples.filter(s => s.folder === "Figure_images/FigS2C/LN_CRC_met_panCKC_FOLR2Y_IL4I1R")[0].base_folder;

      this.isHomePage = true;

    }

    if(this.$route.query.token) {
      this.adminToken = this.$route.query.token ? this.$route.query.token : "";
    }

  }); 
  },
}
</script>

<style>
.relative-container {
  position: relative;
}

div#view {
  flex: 1;
  background-color: black;
  border: 1px solid #000;
  color: white;
  position: relative;
  z-index: 1;
}

div#slide-details {
  position: absolute;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5); 
  color: white;
  padding: 10px;
  z-index: 2;
}

#home-view {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%; 
  height: 60%; 
  background-color: rgba(0, 0, 0, 0.5); 
  color: white;
  z-index: 2; 
  overflow: auto; 
}

#slide-details a {
  color: red;
}

.current-slide {
  background-color: #ccc;
}

.card {
  margin: 10px;
  /* padding: 10px !important; */
}
.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  color: white;
  cursor: pointer;
}
.container {
  display: flex;
  align-items: center;
  width: 50ch; /* adjust as needed */
  flex-wrap: wrap; /* allow the items to wrap to the next line */
}
</style>