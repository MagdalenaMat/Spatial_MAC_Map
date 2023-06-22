<template>
  <v-app>
    <v-app-bar color="primary">
        <v-select
            v-model="selectedSampleDzi"
            :items="samples"
            item-title="folder"
            item-value="dzi"
            label="Standard"></v-select>
      </v-app-bar>
  
    <v-main class="d-flex relative-container">
      <div id="right-arrow-overlay" style="display: none;">
        <span style="font-size: 2em; color: white;">&rarr;</span>
      </div>
      <div id="view"></div>
      <div id="slide-details">
        <ul>
          <li v-for="(stain, index) in currentColors" :key="index" :style="{ color: stain.color }">
            Stain {{ index + 1 }}: {{ stain.stain }}
          </li>
        </ul>
        <a v-if="downloadLink" target="_blank" :href="downloadLink" download>Download slide</a> <br />
        <a v-if="selectedSampleUrl" target="_blank" :href="selectedSampleUrl">Current slide URL</a>
      </div>
    </v-main>

  </v-app>
</template>

<script>
import OpenSeadragon from "openseadragon";
import samples from "../lib/data.json";

const base_url = "https://storage.googleapis.com/spatial-mac-map";

export default {
  components: {
  },
  data() {
    return {
      selectedSample: {},
      selectedSampleName: "",
      selectedSampleDzi: "",
      selectedSampleUrl: "",
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
          color: "blue"
        }
      ],
      overlays: [],
    }
  },
  computed: {
  },
  watch: {
    selectedSampleDzi: function () {
      this.loadSample();
    }
  },
  methods: {
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
      });

    },

    reloadSlide() {
      let currentSlide = `${base_url}/${this.selectedSampleDzi}`;
      this.downloadLink = currentSlide.slice(0, -4) + ".tif";
      this.selectedSampleUrl = `https://magdalenamat.github.io/Spatial_MAC_Map/?slide=${this.selectedSample.folder}`;
      this.viewer.open(currentSlide)
    },

    loadSample() {
      this.selectedSample = this.samples.filter(s => s.dzi === this.selectedSampleDzi)[0];

      this.currentColors = this.selectedSample.name.split("_").filter(s => s.match(/[A-Z]$/)).map(s => {
        return {
          stain: s.slice(0, -1),
          letter: s.slice(-1),
          color: this.colorOptions.filter(c => c.letter === s.slice(-1))[0].color
        }
        
      });

      this.currentColors.unshift({
            stain: "DAPI",
            letter: "B",
            color: "blue"
          }); 
      this.reloadSlide();
    }

  },
  mounted() {
    this.samples = samples.samples;
    this.loadOpenSeaDragon();

    if(this.$route.query.slide) {
      this.selectedSampleDzi = this.samples.filter(s => s.folder === this.$route.query.slide)[0].dzi;
    } else {
      this.selectedSampleDzi = this.samples[1].dzi;
    }
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
  background-color: rgba(0, 0, 0, 0.5); /* black background with 50% transparency */
  color: white;
  padding: 10px;
  z-index: 2;
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
</style>